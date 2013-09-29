var CommandAutocompleteView = require("./autocomplete");

module.exports = Backbone.View.extend({
  template: require("./index.jade"),
  readonlyInput: require("./readonlyInput.jade"),
  iframeWrapper: require("./iframeWrapper.jade"),
  commandOutput: require("./output.jade"),

  events: {
    "keydown :input": "keydown"
  },
  initialize: function(){
    this.curCommand = this.model;
    this._keycomboListeners = []
  },
  autocomplete: function(){
    var self = this;
    var inputData = {
      name: "/autocomplete",
      uuid: this.model.get("shelluuid"), 
      value: this.$("input").val()
    };
    archconsole.emit("/shells", inputData, function(data){
      self.autocompleteView = new CommandAutocompleteView({model: data});
      self.autocompleteView.on("canceled", function(){
        self.autocompleteView.remove();
        self.autocompleteView = null;
      });
      self.autocompleteView.on("selected", function(entry, index){
        self.$("input").val(self.$("input").val()+entry.match);
        self.autocompleteView.remove();
        self.autocompleteView = null;
      });
      self.$(".autocompleteContainer").append(self.autocompleteView.render().el);
      self.autocompleteView.selectFirst();
      self.autocompleteView.$el.css("top", self.$el.position().top);
      self.autocompleteView.$el.css("left", self.$el.position().left+80+self.$("input").val().length*7);
      self.autocompleteView.baseTop = self.$el.position().top;
    });
  },
  executeCommand: function(){
    var commandData = {
      shelluuid: this.model.get('shelluuid'),
      value: this.$("input").val(),
      name: "/execute"
    }
    this.$("input").replaceWith(this.readonlyInput(commandData));
    this.$(".output").removeClass("hidden");
    this.$(".status").removeClass("alert-info");

    var self = this;
    this.model.set("running", true);

    archconsole.emit("/commands", commandData)
    archconsole.on("/shells/commandstart", function(data){ self.handleCommandStart(data) })
  },
  handleCommandStart: function(data){
    data = data.value 
    var self = this
    if(!data.uuid) return self.handleCommandTermianted(data);
    self.model.set(data);
    self.$(".result").addClass(self.model.get("uuid"));
    self.$el.attr("data-id", self.model.get("uuid"));

    self.handleCommandOutputEvent = "/commands/output";
    self.commandExecuteTerminatedEvent = "/commands/terminated";
    self.commandBindKeyOnceEvent = "/commands/bindkeyonce";
    self.commandTriggerKeySequence = "/commands/trigger/";

    archconsole.on(self.handleCommandOutputEvent, function(data){
      self.handleCommandOutput(data.value);
    });
    archconsole.on(self.commandExecuteTerminatedEvent, function(data){
      self.handleCommandTermianted(data)
    });
    archconsole.on(self.commandBindKeyOnceEvent, function(data){
      self.handleCommandBindKeyOnce(data)
    })
  },
  keydown: function(e){
    var self = this;
    var notTypedSomething = (
      this.$("input").val().length == 0 || 
      (this.curCommand && this.$("input").val() == this.curCommand.get("value"))
    )

    if(e.keyCode == 38 && notTypedSomething) { // up
      e.preventDefault();
      if(this.curCommand.previousCommand) {
        this.curCommand = this.curCommand.previousCommand;
        this.$("input").val(this.curCommand.get("value"));
      } 
      return;
    }

    if(e.keyCode == 40 && notTypedSomething) { // down
      e.preventDefault();
      if(this.curCommand.nextCommand) {
        this.curCommand = this.curCommand.nextCommand;
        this.$("input").val(this.curCommand.get("value"));
      } 
      return;
    }

    if(e.keyCode == 9) { // tab
      e.preventDefault();
      if(self.autocompleteView) {
        self.autocompleteView.selectCurrent();
        return;
      }
      self.autocomplete();
      return;
    } 

    if(self.autocompleteView) {
      if(!self.autocompleteView.keydown(e)) {
        if(self.autocompleteView) {
          self.autocompleteView.remove();
          self.autocompleteView = null;
        }
        if(self.autocompleteTimeoutID)
          clearTimeout(self.autocompleteTimeoutID);
        self.autocompleteTimeoutID = setTimeout(function(){
          self.autocomplete();  
        }, 50);
      }
      return;
    }

    if(e.keyCode == 13) {
      e.preventDefault();
      self.executeCommand();
    } 
  },
  handleCommandOutput : function(data){
    if(data.indexOf("<iframe") !== -1 && data.indexOf("</iframe>") !== -1) {
      this.fullScreenMode = true;
      this.$el.html(this.iframeWrapper({content: data}));  // just as experiment
    } else {
      var $output = this.$("."+this.model.get("uuid"));
      if($output.length) {
        this.outputBuffer += data;
        $output.append(data);
      } else
        this.outputBuffer += data;
    }
    window.scrollTo(0, document.body.scrollHeight);
  },
  handleCommandBindKeyOnce: function(data){
    var self = this;
    self.registerKeyCombo(KeyboardJS.on(data.keySequence, function(){
      self.clearAllKeycombos()
      archconsole.emit(self.commandTriggerKeySequence+data.keySequence)
    }))
  },
  registerKeyCombo: function(listener) {
    this._keycomboListeners.push(listener)
  },
  clearAllKeycombos: function(){
    this._keycomboListeners.forEach(function(listener){
      listener.clear()
    })
    this._keycomboListeners = []
  },
  handleCommandTermianted: function(data){
    this.model.set("running", false);
    if(this.fullScreenMode) { // still from the experiment
      this.$el.find("iframe").remove(); 
      this.$el.html(this.commandOutput({
        input: this.model.get("value"),
        output: this.outputBuffer
      }));
    }

    if(data.code == 0)
      this.$(".status").addClass("alert-success");
    else
      this.$(".status").addClass("alert-error");
    
    archconsole.removeListener(this.handleCommandOutputEvent, this.handleCommandOutput);
    archconsole.removeListener(this.commandExecuteTerminatedEvent, this.handleCommandTermianted);
    archconsole.removeListener(this.commandBindKeyOnceEvent, this.handleCommandBindKeyOnce)
    
    this.trigger("finished");
    this.unbind();
    window.scrollTo(0, document.body.scrollHeight);
  },
  render: function(){
    this.$el.html(this.template()); 
    this.$("input").focus();
    return this;
  }
});
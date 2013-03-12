var CommandAutocompleteView = require("./autocomplete");

module.exports = Backbone.View.extend({
  template: jadeCompile(require("./index.jade")),
  readonlyInput: jadeCompile(require("./readonlyInput.jade.raw")),
  iframeWrapper: jadeCompile(require("./iframeWrapper.jade.raw")),
  commandOutput: jadeCompile(require("./output.jade.raw")),

  events: {
    "keydown :input": "keydown"
  },
  initialize: function(){
    this.curCommand = this.model;
  },
  autocomplete: function(){
    var self = this;
    var inputData = {uuid: this.model.get("shelluuid"), value: this.$("input").val()};
    archconsole.emit("GET /shells/autocomplete", inputData, function(data){
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
      value: this.$("input").val()
    }
    this.$("input").replaceWith(this.readonlyInput(commandData));
    this.$(".output").removeClass("hidden");
    this.$(".status").removeClass("alert-info");

    var self = this;
    this.model.set("running", true);

    archconsole.emit("POST /commands/execute", commandData, function(data){
      if(!data.uuid) return self.handleCommandTermianted(data);
      self.model.set(data);
      self.$(".result").addClass(self.model.get("uuid"));
      self.$el.attr("data-id", self.model.get("uuid"));
      self.handleCommandOutputEvent = self.model.get("shelluuid")+"/"+self.model.get("uuid")+"/output";
      self.commandExecuteTerminatedEvent = self.model.get("shelluuid")+"/"+self.model.get("uuid")+"/terminated";
      archconsole.on(self.handleCommandOutputEvent, function(data){
        self.handleCommandOutput(data);
      });
      archconsole.on(self.commandExecuteTerminatedEvent, function(data){
        self.handleCommandTermianted(data)
      });
    });
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
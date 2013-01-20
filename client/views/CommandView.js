var CommandAutocompleteView = require("./CommandAutocompleteView");

module.exports = Backbone.View.extend({
  readonlyInput: jadeCompile(require("../templates/readonlyInput.jade.raw")),
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
    $(window).bind('keydown', this.comamndKeydown.bind(this));
    var self = this;
    archconsole.emit("POST /commands/execute", commandData, function(data){
      self.model.set(data);
      self.$(".result").addClass(self.model.get("uuid"));
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
  comamndKeydown: function(e){
    if(e.shiftKey && e.ctrlKey && e.keyCode == 67) { // SHIFT+CTRL+C
      e.preventDefault();
      archconsole.emit("POST /commands/terminate", this.model.toJSON());
    }
  },
  keydown: function(e){
    var self = this;
    var notTypedSomething = (
      this.$("input").val().length == 0 || 
      (this.curCommand && this.$("input").val() == this.curCommand.get("value"))
    )

    if(e.keyCode == 38 && notTypedSomething) {
      e.preventDefault();
      if(this.curCommand.previousCommand) {
        this.curCommand = this.curCommand.previousCommand;
        this.$("input").val(this.curCommand.get("value"));
      } 
      return;
    }

    if(e.keyCode == 40 && notTypedSomething) {
      e.preventDefault();
      if(this.curCommand.nextCommand) {
        this.curCommand = this.curCommand.nextCommand;
        this.$("input").val(this.curCommand.get("value"));
      } 
      return;
    }

    if(e.keyCode == 9) {
      e.preventDefault();
      if(self.autocompleteView) {
        self.autocompleteView.remove();
        self.autocompleteView = null;
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
    this.$("."+this.model.get("uuid")).append(data);
    window.scrollTo(0, document.body.scrollHeight);
  },
  handleCommandTermianted: function(data){
    if(data.code == 0)
      this.$(".status").addClass("alert-success");
    else
      this.$(".status").addClass("alert-error");
    archconsole.removeListener(this.handleCommandOutputEvent, this.handleCommandOutput);
    archconsole.removeListener(this.commandExecuteTerminatedEvent, this.handleCommandTermianted);
    this.trigger("finished");
    this.unbind();
    $(window).unbind('keydown', this.comamndKeydown);
    $('html, body').animate({
       scrollTop: $(document).height()
    }, 500);
  },
  render: function(){
    this.$el.html(require("../templates/command.jade")); 
    this.$("input").focus();
    $('html, body').animate({
       scrollTop: $(document).height()
    }, 500);
  }
});
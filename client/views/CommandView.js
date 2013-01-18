module.exports = Backbone.View.extend({
  readonlyInput: jadeCompile(require("../templates/readonlyInput.jade.raw")),
  events: {
    "keydown :input": "keypress"
  },
  keypress: function(e){

    var self = this;

    if(e.keyCode == 13) {

      var commandData = {
        shelluuid: this.model.get('shelluuid'),
        value: this.$("input").val()
      }

      this.$("input").replaceWith(this.readonlyInput(commandData));

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
    }

    if(e.ctrlKey && e.keyCode == 67) { // CTRL+C
      archconsole.emit("POST /commands/terminate", self.model.toJSON());
    }
  },
  handleCommandOutput : function(data){
    this.$("."+this.model.get("uuid")).append(data);
  },
  handleCommandTermianted: function(data){
    archconsole.removeListener(this.handleCommandOutputEvent, this.handleCommandOutput);
    archconsole.removeListener(this.commandExecuteTerminatedEvent, this.handleCommandTermianted);
    this.trigger("finished");
    this.unbind();
  },
  render: function(){
    this.$el.html(require("../templates/command.jade")); 
    this.$("input").focus();
  }
});
var Command = require("./Command");

module.exports = Backbone.Model.extend({
  initialize: function(){
    this.currentCommandTitle = "shell";
  },
  createNewCommand: function(){
    var command = new Command({
      shelluuid: this.get('uuid')
    });
    command.on("change", function(){
      if(command.get("running"))
        this.currentCommandTitle = command.get("value");
      else
        this.currentCommandTitle = "shell";
      this.trigger("currentCommand:changed");
    }, this);
    if(this.currentCommand) {
      this.currentCommand.nextCommand = command;
      command.previousCommand = this.currentCommand;
    }
    this.currentCommand = command;
    return command;
  },
  getCurrentCommandTitle: function(){
    return this.currentCommandTitle;
  }
});
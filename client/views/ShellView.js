var Command = require("../models/Command");
var CommandView = require("./CommandView");

module.exports = Backbone.View.extend({
  initialize: function(){
  },
  createNewCommand : function(){
    var command = new Command({
      shelluuid: this.model.get('uuid')
    });
    if(this.commandView)
      command.previousCommand = this.commandView.model;
    var commandContainer = $("<div class='command'></div>");
    this.$el.append(commandContainer);
    this.commandView = new CommandView({el: commandContainer, model: command});
    this.commandView.on("finished", this.createNewCommand, this);
    this.commandView.render();
  },
  render: function(){
    this.$el.html("");
    this.createNewCommand();
    return this;
  }
});
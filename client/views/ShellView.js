var Command = require("../models/Command");
var CommandView = require("./CommandView");

module.exports = Backbone.View.extend({
  initialize: function(){
  },
  createNewCommand : function(){
    if(this.commandView)
      this.model.history.push(this.commandView.$el.html());
    var command = new Command({
      shelluuid: this.model.get('uuid')
    });
    var commandContainer = $("<div class='command'></div>");
    this.$el.append(commandContainer);
    this.commandView = new CommandView({el: commandContainer, model: command});
    this.commandView.on("finished", this.createNewCommand, this);
    this.commandView.render();
  },
  render: function(){
    this.$el.html("");
    for(var i = 0; i<this.model.history.length; i++)
      this.$el.append(this.model.history[i]);
    this.createNewCommand();
    return this;
  }
});
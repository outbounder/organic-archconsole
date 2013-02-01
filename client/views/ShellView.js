var CommandView = require("./CommandView");

module.exports = Backbone.View.extend({
  initialize: function(){
    this.commandViews = [];
  },
  createNewCommand : function(){
    this.commandView = new CommandView({model: this.model.createNewCommand()});
    this.commandView.on("finished", this.createNewCommand, this);
    this.$el.append(this.commandView.render().el);
    this.commandViews.push(this.commandView);
    this.currentCommand = this.commandView.model;
    window.scrollTo(0, document.body.scrollHeight);
    this.commandView.$el.find("input").focus();
  },
  render: function(){
    this.$el.html("");
    for(var i = 0; i<this.commandViews.length; i++) {
      this.$el.append(this.commandViews[i].el);
      if(i == this.commandViews.length-1)
        this.commandViews[i].delegateEvents();
    }
    window.scrollTo(0, document.body.scrollHeight);
    return this;
  }
});
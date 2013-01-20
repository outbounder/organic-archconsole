module.exports = Backbone.View.extend({
  template: jadeCompile(require('../templates/shellBtn.jade.raw')),
  events:{
    "click": "executeAgain"
  },
  executeAgain: function(e){
    // not good at all
    runtime.archconsoleView.currentShellView.commandView.$el.find("input").val(this.model.get("value"));
    runtime.archconsoleView.currentShellView.commandView.executeCommand();
  },
  render: function(){
    this.$el.html(this.template({model: this.model}));
    return this;
  }
})
module.exports = Backbone.View.extend({
  template: jadeCompile(require('../templates/shellBtn.jade.raw')),
  tagName: "li",
  events:{
    "click": "executeAgain"
  },
  executeAgain: function(e){
    // not good at all
    var isRunning = this.model.get("running");
    if(isRunning === false) {
      runtime.archconsoleView.currentShellView.commandView.$el.find("input").val(this.model.get("value"));
      runtime.archconsoleView.currentShellView.commandView.executeCommand(this.model.get('cwd'));
    } else 
    if(isRunning === true) {
      $.scrollTo(".command[data-id="+this.model.get("uuid")+"]", {
        offset: {left: 0, top: -150}
      });
    }
  },
  render: function(){
    this.$el.html(this.template({model: this.model}));
    if(this.model.get("running"))
      this.$el.addClass('active');
    return this;
  }
})
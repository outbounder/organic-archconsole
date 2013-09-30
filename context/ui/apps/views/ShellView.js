var CommandView = require("./commandview");

module.exports = Backbone.View.extend({
  initialize: function(){
    this.commandViews = [];

    var self = this
    archconsole.on("/shells/commandstart", function(data){
      var view = _.find(self.commandViews, function(v){ return v.model.cid == data.value.cid })
      view.onStart(data.value)
    })
    archconsole.on("/commands/output", function(data){
      var view = _.find(self.commandViews, function(v){ return v.model.get("uuid") == data.uuid})
      view.onOutput(data.value)
    })
    archconsole.on("/commands/terminated", function(data){
      var view = _.find(self.commandViews, function(v){ return v.model.get("uuid") == data.uuid})
      view.onTerminated(data.code)
    })
  },
  createNewCommand : function(){
    this.commandView = new CommandView({model: this.model.createNewCommand()});
    this.commandView.on("finished", this.createNewCommand, this);
    
    if(this.visible) // append only if visible
      this.$el.append(this.commandView.render().el);

    this.commandViews.push(this.commandView);
    this.currentCommand = this.commandView.model;
    window.scrollTo(0, document.body.scrollHeight);
    this.commandView.$el.find("input").focus();

    // prevent too long history
    if(this.commandViews.length > 100) {
      this.commandViews = this.commandViews.splice(1,99);
    }
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
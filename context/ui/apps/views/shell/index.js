var CommandInput = require("../commandinput");
var Command = require("../command")

module.exports = Backbone.View.extend({
  template: require("./index.jade"),
  initialize: function(){
    var self = this
    self.commands = []
    archconsole.on("/shells/commandstart", function(data){
      var view = new Command({model: self.model.createNewCommand()})
      self.$el.find(".commandsContainer").append(view.render().el)
      view.model.trigger("start", data.value)
      self.commands.push(view)
    })
    archconsole.on("/commands/output", function(data){
      var view = _.find(self.commands, function(v){ return v.model.get("uuid") == data.uuid})
      view.model.trigger("output", data.value)
      window.scrollTo(0, document.body.scrollHeight);
    })
    archconsole.on("/commands/terminated", function(data){
      var view = _.find(self.commands, function(v){ return v.model.get("uuid") == data.uuid})
      view.model.trigger("terminated", data.code)
      window.scrollTo(0, document.body.scrollHeight);
    })
  },
  render: function(){
    this.$el.html(this.template());
    this.commandInput = new CommandInput({model: this.model.createNewCommand()});
    this.$el.find(".commandContainer").append(this.commandInput.render().el);
    this.commandInput.postRender()
    window.scrollTo(0, document.body.scrollHeight);
    return this;
  }
});
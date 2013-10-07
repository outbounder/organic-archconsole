var CommandInput = require("../commandinput");
var Command = require("../command")

module.exports = Backbone.View.extend({
  template: require("./index.jade"),
  statusbarTemplate: require("./statusbar.jade"),

  initialize: function(){
    var self = this

    this.model.on("change", this.updateStatusBar, this)
    self.commands = []
    archconsole.on("/shells/commandstart", function(data){
      var view = new Command({model: self.model.createNewCommand()})
      self.$el.find(".commandsContainer").append(view.render().el)
      view.model.trigger("start", data.value)
      self.commands.push(view)
      self.lastStartedCommand = view.model
      self.commandInput.indicateCommandChange({started: true, uuid: data.value.uuid})
      //self.commandInput.$el.hide()
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
      self.commandInput.indicateCommandChange({started: false, uuid: data.uuid})
      //self.commandInput.$el.show().focus()
    })
    archconsole.on("/commands/bindkeyonce", function(data){
      var view = _.find(self.commands, function(v){ return v.model.get("uuid") == data.uuid})
      view.model.trigger("bindkeyonce", data.keySequence, data.cmd_id)
    })
    archconsole.on("/commands/bindkey", function(data){
      var view = _.find(self.commands, function(v){ return v.model.get("uuid") == data.uuid})
      view.model.trigger("bindkey", data.keySequence, data.cmd_id)
    })
  },
  updateStatusBar: function(){
    this.$(".statusbarContainer").html(this.statusbarTemplate({
      model: this.model
    }));
  },
  render: function(){
    this.$el.html(this.template());
    this.updateStatusBar()
    this.commandInput = new CommandInput({model: this.model.createNewCommand()});
    this.$el.find(".commandContainer").append(this.commandInput.render().el);
    this.commandInput.postRender()
    window.scrollTo(0, document.body.scrollHeight);
    return this;
  }
});
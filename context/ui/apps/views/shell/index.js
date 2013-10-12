var CommandInput = require("../commandinput");
var Command = require("../command")

module.exports = Backbone.View.extend({
  template: require("./index.jade"),
  statusbarTemplate: require("./statusbar.jade"),

  initialize: function(){
    var self = this

    self.dockedAtBottom = true
    $(window).scroll(function(){
      if($(window).scrollTop() + $(window).height() == $(document).height())
        self.dockedAtBottom = true
      if($(window).scrollTop() + $(window).height() < $(document).height()-$(window).height()/4)
        self.dockedAtBottom = false
    })

    var scrollToBottom = function(){
      if(self.dockedAtBottom)
        window.scrollTo(0, document.body.scrollHeight);
    }

    this.model.on("change", this.updateStatusBar, this)
    self.commands = []
    archconsole.on("/shells/commandstart", function(data){
      var view = new Command({model: self.model.createNewCommand()})
      self.$el.find(".commandsContainer").append(view.render().el)
      view.model.trigger("start", data.value)
      self.commands.push(view)
      self.lastStartedCommand = view.model
      self.commandInput.indicateCommandChange({started: true, uuid: data.value.uuid})
      self.updateStickyCommands()
      scrollToBottom()
    })
    archconsole.on("/commands/output", function(data){
      var view = _.find(self.commands, function(v){ return v.model.get("uuid") == data.uuid})
      view.model.trigger("output", data.value)
      scrollToBottom()
    })
    archconsole.on("/commands/terminated", function(data){
      var view = _.find(self.commands, function(v){ return v.model.get("uuid") == data.uuid})
      view.model.trigger("terminated", data.code)
      self.commandInput.indicateCommandChange({started: false, uuid: data.uuid})
      self.updateStickyCommands()
      scrollToBottom()
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
  globalKeypress: function(e) {
    if(e.keyCode == 32 && e.ctrlKey) {
      if(this.commandInput.hasFocus()) {
        this.dockedAtBottom = false
        this.commandInput.blur()
      } else
        this.commandInput.focus()
    }
  },
  updateStickyCommands: function(){
    var runningCount = 0
    for(var i = 0; i<this.commands.length; i++)
      if(this.commands[i].model.get("running") == true)
        this.commands[i].updateStickyOffset(runningCount++)
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

var ShellView = require("./shell");
var Shell = require("models/client/Shell");

module.exports = Backbone.View.extend({

  events: {
  },

  initialize: function(options){
    var self = this
    $(window).bind("keydown", this.globalKeyDown.bind(this));
    $(window).bind("keydown", function(e){
      self.currentShellView.globalKeypress(e)
    })
    archconsole.on("/shells/updated", function(data){
      self.currentShell.set(data.value);
    });
  },
  globalKeyDown: function(e){
    var self = this;
    var lastStartedCommand = this.currentShellView.lastStartedCommand
    if(!lastStartedCommand) return
    var uuid = lastStartedCommand.get("uuid")

    if(e.shiftKey && e.ctrlKey && e.keyCode == 67) { // SHIFT+CTRL+C
      e.preventDefault();
      archconsole.emit("/commands", {name: "/terminate", uuid: uuid})
    }
    if(e.shiftKey && e.ctrlKey && e.keyCode == 13) { // SHIFT+CTRL+ENTER
      e.preventDefault();
      archconsole.emit("/commands", {name: "/restart", uuid: uuid})
    }
  },
  createNewShell: function(){
    var self = this;
    archconsole.emit("/shells", {"name": "/create"}, function(shellData){
      var shell = self.currentShell = new Shell(shellData);
      self.currentShellView = new ShellView({model: shell, el: $(".shellContainer")});
      self.currentShellView.visible = true;
      self.render();
    });
  },
  render: function(){
    this.currentShellView.render();
    return this;
  }
});

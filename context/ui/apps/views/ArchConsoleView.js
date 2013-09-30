var ShellView = require("./ShellView");
var Shell = require("models/client/Shell");

module.exports = Backbone.View.extend({
  menu: require("../templates/menu.jade"),
  statusbar: require("../templates/statusbar.jade"),

  events: {
  },
  
  initialize: function(options){
    var self = this
    $(window).bind("keydown", this.globalKeyDown.bind(this));
    archconsole.on("/shells/updated", function(data){
      self.currentShell.set(data.value);
    });
  },
  globalKeyDown: function(e){
    var self = this;
    if(e.shiftKey && e.ctrlKey && e.keyCode == 67) { // SHIFT+CTRL+C
      e.preventDefault();
      var uuid = this.currentShellView.currentCommand.get("uuid")
      archconsole.emit("/commands", {name: "/terminate", uuid: uuid})
    }
    if(e.shiftKey && e.ctrlKey && e.keyCode == 13) { // SHIFT+CTRL+ENTER
      var uuid = this.currentShellView.currentCommand.get("uuid")
      var cmdValue = this.currentShellView.currentCommand.get("value")
      archconsole.emit("/commands", {name: "/terminate", uuid: uuid}, function(){
        self.currentShellView.commandView.$("input").val(cmdValue);
        self.currentShellView.commandView.executeCommand();
      })
    }
  },
  createNewShell: function(){
    var self = this;
    archconsole.emit("/shells", {"name": "/create"}, function(shellData){
      var shell = self.currentShell = new Shell(shellData);
      shell.on("change", self.updateStatusbar, self);
      self.currentShellView = new ShellView({model: shell, el: $(".shellContainer")});
      self.currentShellView.visible = true;
      self.render();
      self.currentShellView.createNewCommand();
    });
  },
  updateStatusbar: function(){
    this.$(".statusbarContainer").html(this.statusbar({
      user: this.model, shell: this.currentShell}));
    return this;
  },
  render: function(){
    this.updateStatusbar();
    this.currentShellView.render();
    return this;
  }
});
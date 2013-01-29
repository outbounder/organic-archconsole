var ShellView = require("./ShellView");
var Shell = require("../models/Shell");

module.exports = Backbone.View.extend({
  menu: jadeCompile(require("../templates/menu.jade.raw")),
  statusbar: jadeCompile(require("../templates/statusbar.jade.raw")),

  events: {
    "click .addShell": "createNewShell",
    "click .shellBtn": "switchToShell"
  },
  
  initialize: function(options){
    this.shells = [];
    this.shellViews = [];
    $(window).bind("keydown", this.globalKeyDown.bind(this));
  },
  globalKeyDown: function(e){
    if(e.shiftKey && e.ctrlKey && e.keyCode == 67) { // SHIFT+CTRL+C
      e.preventDefault();
      archconsole.emit("POST /commands/terminate", this.currentShellView.currentCommand.toJSON());
    }
  },
  createNewShell: function(){
    var self = this;
    archconsole.emit("POST /shells/create", {}, function(shellData){
      var shell = self.currentShell = new Shell(shellData);
      shell.on("change", self.updateStatusbar, self);
      shell.on("currentCommand:changed", self.updateMenu, self);
      
      archconsole.on(shell.get('uuid')+"/updated", function(data){
        shell.set(data);
      });

      self.shells.push(shell);

      self.currentShellView = new ShellView({model: shell, el: $(".shellContainer")});
      self.shellViews.push(self.currentShellView);
      self.render();

      self.currentShellView.createNewCommand();
    });
  },
  switchToShell: function(e){
    var shellUUID = $(e.currentTarget).attr("data-id");
    for(var i = 0; i<this.shells.length; i++)
      if(this.shells[i].get("uuid") == shellUUID) {
        this.currentShell = this.shells[i];
        this.currentShellView = this.shellViews[i];
        this.currentShellView.render();
        $(".shellBtns li").removeClass("active");
        $(e.currentTarget).addClass("active");
      }
  },
  updateStatusbar: function(){
    this.$(".statusbarContainer").html(this.statusbar({
      user: this.model, shell: this.currentShell}));
    return this;
  },
  updateMenu: function(){
    this.$(".menuContainer").html(this.menu({
      user: this.model, 
      shells: this.shells, 
      currentShell: this.currentShell
    }));
  },
  render: function(){
    this.updateMenu();
    this.updateStatusbar();
    this.currentShellView.render();
    return this;
  }
});
var ShellView = require("./ShellView");
var Shell = require("../models/Shell");

module.exports = Backbone.View.extend({
  menu: jadeCompile(require("../templates/menu.jade.raw")),
  statusbar: jadeCompile(require("../templates/statusbar.jade.raw")),

  events: {
    "click .addShell": "createNewShell",
    "click .shellBtn": "switchToShell",
    "click li .close": "closeShell"
  },
  
  initialize: function(options){
    this.shells = [];
    this.shellViews = [];
    $(window).bind("keydown", this.globalKeyDown.bind(this));
  },
  globalKeyDown: function(e){
    var self = this;
    if(e.shiftKey && e.ctrlKey && e.keyCode == 67) { // SHIFT+CTRL+C
      e.preventDefault();
      archconsole.emit("POST /commands/terminate", this.currentShellView.currentCommand.toJSON());
    }
    if(e.shiftKey && e.ctrlKey && e.keyCode == 13) { // SHIFT+CTRL+ENTER
      var cmd = this.currentShellView.currentCommand.toJSON();
      archconsole.emit("POST /commands/terminate", cmd, function(){
        self.currentShellView.commandView.$("input").val(cmd.value);
        self.currentShellView.commandView.executeCommand();
      }); 
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
      for(var i = 0; i<self.shells.length; i++)
        self.shells[i].visible = false;
      self.currentShellView.visible = true;
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
        for(var i = 0; i<this.shells.length; i++)
          this.shells[i].visible = false;
        this.currentShellView.visible = true;
        $(".shellBtns li").removeClass("active");
        $(e.currentTarget).addClass("active");
        this.updateStatusbar();
      }
  },
  closeShell: function(e){
    var shellUUID = $(e.currentTarget).attr("data-id");
    for(var i = 0; i<this.shells.length; i++)
      if(this.shells[i].get("uuid") == shellUUID) {
        archconsole.emit("DELETE /shells/remove", shellUUID);
        this.shells.splice(i, 1);
        this.shellViews.splice(i, 1);
        if(i >= this.shells.length)
          i = this.shells.length - 1;
        if(i >= 0) {
          this.currentShell = this.shells[i];
          this.currentShellView = this.shellViews[i];
          this.currentShellView.render();
        } else 
          this.createNewShell();
        this.updateMenu();
        this.updateStatusbar();
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
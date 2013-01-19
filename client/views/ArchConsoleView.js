var ShellView = require("./ShellView");

module.exports = Backbone.View.extend({
  menu: jadeCompile(require("../templates/menu.jade.raw")),
  statusbar: jadeCompile(require("../templates/statusbar.jade.raw")),
  
  initialize: function(options){
    this.shell = options.shell;
    this.currentShellView = new ShellView({model: options.shell, el: $(".shellContainer")});
    this.shell.on("change", this.updateStatusbar, this);
  },
  updateStatusbar: function(){
    this.$(".statusbarContainer").html(this.statusbar({
      user: this.model, shell: this.shell}));
    return this;
  },
  render: function(){
    this.$(".menuContainer").html(this.menu({user: this.model}));
    this.updateStatusbar();
    this.currentShellView.render();    
    return this;
  }
});
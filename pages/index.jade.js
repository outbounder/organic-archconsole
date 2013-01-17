require("../client/vendor");

var archconsole = io.connect();

var ArchConsoleView = require("../client/views/ArchConsoleView");
var ShellView = require("../client/views/ShellView");
var UserSession = require("../client/models/UserSession");
var Shell = require("../client/models/Shell");
var NewShellDialog = require("../client/views/NewShellDialog");

var view;
var Router = Backbone.Router.extend({

  routes: {
    "": "noShell",
    "newShell": "newShell",
    "shell/:name": "gotoShell",
  },

  noShell: function(){
    if(view.newShellDialog)
      view.newShellDialog.remove();
  },

  newShell: function() {
    view.newShellDialog = new NewShellDialog();
    view.newShellDialog.on("createNewShell", function(shellOptions){
      view.newShellDialog.remove();
      console.log("HERE");
      archconsole.emit("POST /shells/create", shellOptions, function(shellData){
        var shell = new Shell(shellData);
        var shellView = new ShellView({model: shell, el: $(".shellContainer")});
        shellView.render();
      });
    });
    view.newShellDialog.render();
  },

  gotoShell : function(shellName) {
  }
});

var router = new Router();

var userSession = new UserSession();
view = new ArchConsoleView({model: userSession, el: $(".container")});
view.render();
Backbone.history.start({pushState: false, trigger: true});

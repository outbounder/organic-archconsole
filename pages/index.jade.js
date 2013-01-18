require("../client/vendor");

jadeCompile = function(path){
  var compiled = jade.compile(path);
  return function(data) {
    data = data || {};
    data.t = $.t;
    return compiled(data);
  }
};

archconsole = io.connect();

var ArchConsoleView = require("../client/views/ArchConsoleView");
var ShellView = require("../client/views/ShellView");
var UserSession = require("../client/models/UserSession");
var Shell = require("../client/models/Shell");
var NewShellDialog = require("../client/views/NewShellDialog");

var view;
var shells = new Backbone.Collection();
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
    var shellBtnTemplate = jadeCompile(require("../client/templates/shellBtn.jade.raw"));
    view.newShellDialog = new NewShellDialog();
    view.newShellDialog.on("createNewShell", function(shellOptions){
      view.newShellDialog.remove();
      archconsole.emit("POST /shells/create", shellOptions, function(shellData){
        var shell = new Shell(shellData);
        $(".shellBtns").append(shellBtnTemplate({
          title: shell.get("uuid"),
          url: "shell/"+shell.get("uuid")
        }));
        shells.push(shell);
        router.navigate("shell/"+shell.get("uuid"), true);
      });
    });
    view.newShellDialog.render();
  },

  gotoShell : function(shellUUID) {
    if(view.currentShellView)
      view.currentShellView.model.set("history", $(".shellContainer").html());

    var shell = shells.find(function(s){
      return s.get("uuid") == shellUUID;
    });
    if(!shell) {
      return router.navigate("newShell", true);
    }

    view.currentShellView = new ShellView({model: shell, el: $(".shellContainer")});
    view.currentShellView.render();
  }
});

var router = new Router();

var userSession = new UserSession();
view = new ArchConsoleView({model: userSession, el: $(".container")});
view.render();
Backbone.history.start({pushState: false, trigger: true});
require("./vendor");
config = require("config")

runtime = {};

var User = require("models/client/User");

var ArchConsoleView = require("./views/ArchConsoleView");

archconsole = io.connect(config.endpoint);
archconsole.emit("/user", {}, function(data){
  runtime.user = new User(data);

  var view = new ArchConsoleView({model: runtime.user, el: $(".container")});
  runtime.archconsoleView = view;
  view.createNewShell();
});

if(window.isNodeWebkit)
  document.body.className = "nodewebkit"
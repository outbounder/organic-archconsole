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

if(window.isNodeWebkit) {

  require("./vendor/nodewebkit/isfocused")

  document.body.className = "nodewebkit"
  var gui = nwrequire('nw.gui')
  var win = gui.Window.get()
  archconsole.on("/shells/updated", function(data){
    win.title = data.value.cwd.split("/").pop()
  })
  archconsole.on("/shells/active", function(data){
    if(data.active == true) {
      var option = {
        key : "Ctrl+Alt+A",
        active : function() {
          if(window.frame.isFocused) {
            console.log("HIDE?")
            win.hide()
          } else {
            win.show()
            win.focus()
          }
        },
        failed : function(msg) {
          // :(, fail to register the |key| or couldn't parse the |key|.
          alert(msg);
        }
      };

      // Create a shortcut with |option|.
      window.activateShortcut = new gui.Shortcut(option);
      // Register global desktop shortcut, which can work without focus.
      gui.App.registerGlobalHotKey(window.activateShortcut);
    } else {
      if(window.activateShortcut)
        gui.App.unregisterGlobalHotKey(window.activateShortcut)
      window.activateShortcut = null
    } 
  })
}

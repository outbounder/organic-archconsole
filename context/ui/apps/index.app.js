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
  var gui = nwrequire("nw.gui")
  window.frame = gui.Window.get();
  require("./vendor/nodewebkit/isfocused")

  document.body.className = "nodewebkit"
  archconsole.on("/shells/updated", function(data){
    window.frame.title = data.value.cwd.split("/").pop()
  })
  window.frame.on("focus", function(){
    console.log("FOCUSED, sending active")
    archconsole.emit("/shells", {
      "name": "/active",
      "uuid": runtime.archconsoleView.currentShellView.model.get("uuid")
    })
  })
  archconsole.on("/shells/active", function(data){
    if(data.active == true) {
      console.log("ACTIVE")
      var option = {
        key : "Ctrl+Alt+A",
        active : function() {
          if(window.frame.isFocused) {
            window.frame.minimize()
          } else {
            window.frame.restore()
            window.frame.focus()
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
      console.log("NOT ACTIVE")
      if(window.activateShortcut)
        gui.App.unregisterGlobalHotKey(window.activateShortcut)
      window.activateShortcut = null
    } 
  })
}

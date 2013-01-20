var ArchConsoleView = require("./views/ArchConsoleView");
var Shell = require("./models/Shell");

module.exports = Backbone.Router.extend({

  routes: {
    "": "landing"
  },

  landing: function(){
    archconsole.emit("POST /shells/create", {}, function(shellData){
      var shell = new Shell(shellData);
      
      var view = new ArchConsoleView({model: runtime.user, shell: shell, el: $(".container")});
      runtime.archconsoleView = view;
      view.render();

      archconsole.on(shell.get('uuid')+"/updated", function(data){
        shell.set(data);
      });

    });
  }
});
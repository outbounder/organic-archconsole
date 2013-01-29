var ArchConsoleView = require("./views/ArchConsoleView");

module.exports = Backbone.Router.extend({

  routes: {
    "": "landing"
  },

  landing: function(){
    var view = new ArchConsoleView({model: runtime.user, el: $(".container")});
    runtime.archconsoleView = view;
    view.createNewShell();
  }
});
require("./vendor");
config = require("config")

runtime = {};

var User = require("models/client/User");
var Router = Backbone.Router.extend({

  routes: {
    "": "landing"
  },

  landing: function(){
    var view = new ArchConsoleView({model: runtime.user, el: $(".container")});
    runtime.archconsoleView = view;
    view.createNewShell();
  }
})

archconsole = io.connect(config.endpoint);
archconsole.emit("/user", {}, function(data){
  runtime.user = new User(data);
  runtime.router = new Router();
  Backbone.history.start({pushState: false, trigger: true});
});

var ArchConsoleView = require("./views/ArchConsoleView");
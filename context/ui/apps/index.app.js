require("../client/vendor");

jadeCompile = function(path){
  var compiled = jade.compile(path);
  return function(data) {
    data = data || {};
    data.t = $.t;
    return compiled(data);
  }
};

runtime = {};

var User = require("../client/models/User");
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

archconsole = io.connect();
archconsole.emit("GET /user", {}, function(data){
  runtime.user = new User(data);
  runtime.router = new Router();
  Backbone.history.start({pushState: false, trigger: true});
});

var ArchConsoleView = require("./views/ArchConsoleView");
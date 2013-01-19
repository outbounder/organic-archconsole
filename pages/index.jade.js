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
var Router = require("../client/IndexRouter");

archconsole = io.connect();
archconsole.emit("GET /user", {}, function(data){
  runtime.user = new User(data);
  runtime.router = new Router();
  Backbone.history.start({pushState: false, trigger: true});
});
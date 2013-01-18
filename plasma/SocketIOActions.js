var util = require("util");
var Organel = require("organic").Organel;
var glob = require('glob');
var path = require("path");
var _ = require("underscore");

module.exports = function SocketIOActions(plasma, config){
  Organel.call(this, plasma);
  
  this.config = config;

  // bootstrap all actions once httpserver is ready
  this.on("WebSocketServer", function(chemical, sender, callback){
    var io = chemical.data.server;
    var context = {};
    var self = this;

    if(config.cwd)
      for(var key in config.cwd)
        config[key] = process.cwd()+config.cwd[key];
    
    if(config.actionHelpers) {
      glob(config.actionHelpers+"/**/*.js", function(err, files){
        files.forEach(function(file){
          context[path.basename(file, path.extname(file))] = require(file);
        });
        self.loadActions(io, config, context, function(){
          if(callback) return callback();
          self.emit("SocketIOActions");
        });
      });
    } else 
      self.loadActions(io, config, context, function(){
        if(callback) return callback();
        self.emit("SocketIOActions");
      });

    return false;
  });
}

util.inherits(module.exports, Organel);

module.exports.prototype.loadActions = function(io, config, context, callback){
  var actionsRoot = config.actions.split("\\").join("/");
  var self = this;
  glob(actionsRoot+"/**/*.js", function(err, files){
    files.reverse();
    files.forEach(function(file){
      var url = file.replace("_", ":").split("\\").join("/").replace(actionsRoot, "");
      if(config.mount)
        url = config.mount+url;
      if(file.indexOf("/index.js") === -1)
        self.mountSocketIOActions(io, url.replace(".js", ""), require(file).call(context, config));
      else
        self.mountSocketIOActions(io, url.replace("/index.js", ""), require(file).call(context, config));
    });
    if(callback) callback();
  });
}

module.exports.prototype.mountSocketIOActions = function(io, root, actions) {
  var root = actions.root || root;
  var self = this;
  var actionsList = [];
  for(var key in actions) {
    var parts = key.split(" ");
    var method = parts.shift();
    var url = parts.pop();
    var actionHandler = actions[key];
    if(typeof actionHandler === "string") {
      actionHandler = actions[actionHandler];
      if(typeof actionHandler !== "function" && !Array.isArray(actionHandler))
        throw new Error(actionHandler+" was not found");
    }
    url = root+(url?url:"");
    if(url == "") url = "/";
    actionsList.push({ event: method + " " + url, handler: actionHandler});
    if(this.config.log)
      console.log("socketio action", method, url);
  }

  io.on("connection", function(socket){
    actionsList.forEach(function(a){
      socket.on(a.event, function(data, callback){
        a.handler(data, callback, socket);
      });
    })
  })
}
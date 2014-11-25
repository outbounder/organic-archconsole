var path = require('path')
var runtime = require("models/server/runtime");
var Shell = require("models/server/Shell");
var switchByEventname = require("organic-alchemy").ws.switchByEventname
var _ = require("underscore")
var fs = require('fs')
var command = require("./command")

var id = 0;
var uuid = function () {
  return String(id++);
}

module.exports.init = function(){
  var archpackage = require(path.join(process.cwd(),"package.json"));
  var shellSockets = {}

  var notifyDeactivatedNodewebkitClients = function(){
    runtime.shells.forEach(function(shell){
      if(shell.clientType == "nodewebkit")
        shellSockets[shell.uuid].emit("/shells/active", {active: false})
    })
  }

  return switchByEventname({
    "/create": function(c, next){
      var shell = new Shell(c.data);
      shell.uuid = uuid();
      shell.user = runtime.user;
      shell.cwd = process.env.ROOTDIR || process.cwd();
      shell.runningCommand = null;
      shell.commandsHistory = null;
      shell.version = archpackage.version;
      shell.env = _.omit(_.extend({}, process.env), "CELL_MODE")
            
      if(shell.clientType == "nodewebkit") {
        notifyDeactivatedNodewebkitClients()
        c.socket.emit("/shells/active", {active: true})
      }

      runtime.shells.push(shell);
      shellSockets[shell.uuid] = c.socket
      
      c.socket.on("disconnect", function(){
        delete shellSockets[shell.uuid]
        shell.terminate();
        runtime.shells.removeByUUID(shell.uuid);
      })
      fs.readdir(path.join(process.cwd(),"bin","shellstart"), function(err, files){
        files.forEach(function(cmdPath){
          var extendedC = {
            data: {
              value: path.join("shellstart", cmdPath.replace(".js", "")),
              shelluuid: shell.uuid
            },
            socket: c.socket
          }
          command.execute(extendedC)
        })
      })
      
      next(shell.toJSON());
    },
    "/remove": function(c, next){
      var shell = runtime.shells.findByUUID(c.data);
      if(!shell) {
        next(new Error("could not find shell"));
        return;
      }

      delete shellSockets[shell.uuid]
      shell.terminate();
      runtime.shells.removeByUUID(c.data);

      next && next(true);
    },
    "/autocomplete": function(c, next){
      var shells = runtime.shells.findByUUID(c.data.uuid);
      if(!shells)
        return;
      shells.autocomplete(c.data.value, next);
    },
    "/active": function(c, next) {
      notifyDeactivatedNodewebkitClients()
      shellSockets[c.data.uuid].emit("/shells/active", {active: true})
    }
  })
}

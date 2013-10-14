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
  return switchByEventname({
    "/create": function(c, next){
      var shell = new Shell(c.data);
      shell.uuid = uuid();
      shell.user = runtime.user;
      shell.cwd = process.cwd();
      shell.runningCommand = null;
      shell.commandsHistory = null;
      shell.version = archpackage.version;
      shell.env = _.omit(_.extend({}, process.env), "CELL_MODE")
      runtime.shells.push(shell);
      
      c.socket.on("disconnect", function(){
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

      shell.terminate();
      runtime.shells.removeByUUID(c.data);

      next && next(true);
    },
    "/autocomplete": function(c, next){
      var shells = runtime.shells.findByUUID(c.data.uuid);
      if(!shells)
        return;
      shells.autocomplete(c.data.value, next);
    }
  })
}

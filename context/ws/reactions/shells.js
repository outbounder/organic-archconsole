var path = require('path')
var runtime = require("models/server/runtime");
var Shell = require("models/server/Shell");


var id = 0;
var uuid = function () {
  return String(id++);
}

module.exports.init = function(){
  var archpackage = require(path.join(process.cwd(),"package.json"));
  return switchByEventname({
    "*/create": function(data, next){
      var shell = new Shell(data);
      shell.uuid = uuid();
      shell.user = runtime.user;
      shell.cwd = process.cwd();
      shell.runningCommand = null;
      shell.commandsHistory = null;
      shell.version = archpackage.version;
      runtime.shells.push(shell);
      next(shell.toJSON());
    },
    "*/remove": function(data, next){
      var shell = runtime.shells.findByUUID(data);
      if(!shell) {
        next(new Error("could not find shell"));
        return;
      }

      shell.terminate();
      runtime.shells.removeByUUID(data);

      next && next(true);
    },
    "*/autocomplete": function(data, next){
      var shells = runtime.shells.findByUUID(data.uuid);
      if(!shells)
        return;

      shells.autocomplete(data.value, next);
    }
  })
}
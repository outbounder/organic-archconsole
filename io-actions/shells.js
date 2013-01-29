var Shell = require("../models/Shell");
var runtime = require("../models/runtime");

var id = 0;
var uuid = function () {
  return String(id++);
}

module.exports = function(config){
  var archpackage = require("../package.json");
  return {
    "POST /create": function(data, callback){
      var shell = new Shell(data);
      shell.uuid = uuid();
      shell.user = runtime.user;
      shell.cwd = process.cwd();
      shell.runningCommand = null;
      shell.commandsHistory = null;
      shell.version = archpackage.version;
      runtime.shells.push(shell);
      callback(shell.toJSON());
    },
    "DELETE /remove": function(data, callback){
      var shell = runtime.shells.findByUUID(data);
      if(!shell) {
        callback(new Error("could not find shell"));
        return;
      }

      shell.terminate();
      runtime.shells.removeByUUID(data);

      if(callback) callback(true);
    },
    "GET /autocomplete": function(data, callback){
      var shells = runtime.shells.findByUUID(data.uuid);
      if(!shells)
        return;

      shells.autocomplete(data.value, callback);
    }
  }
}
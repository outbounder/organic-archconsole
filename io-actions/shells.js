var Shell = require("../models/Shell");
var runtime = require("../models/runtime");

var id = 0;
var uuid = function () {
  return String(id++);
}

module.exports = function(config){
  return {
    "POST /create": function(data, callback){
      if(!data.name) {
        callback(new Error("could not create shell without name"));
        return;
      }

      var shell = new Shell(data);
      shell.uuid = uuid();
      shell.user = null;
      shell.cwd = process.cwd();
      shell.runningCommand = null;
      shell.commandsHistory = null;
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
      runtime.shell.removeByUUID(data);

      callback(true);
    }
  }
}
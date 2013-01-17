var Shell = require("../models/Shell");

var id = 0;
var uuid = function () {
  return String(id++);
}

var shells = [];
shells.findByUUID = function(uuid) {
  for(var i = 0; i<this.length; i++)
    if(this[i].uuid == uuid)
      return this[i];
}
shells.removeByUUID = function(uuid) {
  for(var i = 0; i<this.length; i++)
    if(this[i].uuid == uuid) {
      this.splice(i,1);
      return;
    }
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
      shells.push(shell);

      callback(null, shell.toJSON());
    },
    "DELETE /remove": function(data, callback){
      var shell = archconsole.shells.findByUUID(data);
      if(!shell) {
        callback(new Error("could not find shell"));
        return;
      }

      shell.terminate();
      archconsole.shell.removeByUUID(data);

      callback(null, true);
    }
  }
}
var Command = require("../models/Command");

var id = 0;
var uuid = function () {
  return String(id++);
}

var commands = [];
commands.findByUUID = function(uuid){
  for(var i = 0; i<this.length; i++)
    if(this[i].uuid == uuid)
      return this[i];
}
commands.removeByUUID = function(uuid){
  for(var i = 0; i<this.length; i++)
    if(this[i].uuid == uuid) {
      this.splice(i,1);
      return;
    }
}

module.exports = function(config){
  return {
    "POST /execute": function(){
      var shell = archconsole.shells.findByUUID(data.shelluuid);
      if(!shell) {
        callback(new Error("could not find shell"));
        return;
      }

      var command = new Command(data);
      command.shell = shell;
      command.uuid = uuid();

      shell.runningCommand = command;
      callback(null, command.toJSON());

      command.start(archconsole);
    },
    "POST /keypress": function(){
      var command = archconsole.commands.findByUUID(data.commanduuid);
      if(!command) {
        callback(new Error("could not find command"));
        return;
      }

      if((data.keyCode == "Z" || data.keyCode == "C") && data.modifiers == "CTRL")
        archconsole.emit("archconsole::ui::"+shell.uuid+"::"+command.uuid+"::terminate", data.commanduuid);
    },
    "POST /terminate": function(){
      var command = archconsole.commands.findByUUID(data);
      if(!command) {
        callback(new Error("could not find command"));
        return;
      }

      command.terminate(archconsole);
      archconsole.commands.removeByUUID(data);

      callback(null, true);
    }
  }
}
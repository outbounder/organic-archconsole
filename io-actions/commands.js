var Command = require("../models/Command");
var runtime = require("../models/runtime");
var path = require("path");
var fs = require("fs");

var id = 0;
var uuid = function () {
  return String(id++);
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = function(config){
  return {
    "POST /execute": function(data, callback, socket){
      var shell = runtime.shells.findByUUID(data.shelluuid);
      if(!shell) {
        callback(new Error("could not find shell"));
        return;
      }

      var command = new Command(data);
      command.shell = shell;
      command.uuid = uuid();

      shell.runningCommand = command;
      runtime.commands.push(command);
      
      callback(command.toJSON());

      if(command.value.indexOf("cd ") === 0) {
        var target = data.value.replace("cd ","");
        if(target.indexOf(".") === 0)
          target = path.normalize(path.join(shell.cwd, target));
        else
          target = target.replace("~", getUserHome());
        fs.exists(target, function(e){
          if(e) {
            shell.cwd = target;
            socket.emit(command.shelluuid+"/"+command.uuid+"/output", "cwd is "+shell.cwd);
          } else
            socket.emit(command.shelluuid+"/"+command.uuid+"/output", "not found "+target);
          socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", command.uuid);
        })
      } else
      if(command.value.indexOf("pwd") === 0) {
        socket.emit(command.shelluuid+"/"+command.uuid+"/output", shell.cwd);
        socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", command.uuid);
      } else
        command.start(socket, runtime);
    },
    "POST /terminate": function(data){
      var command = runtime.commands.findByUUID(data.uuid);
      if(!command)
        return;

      command.terminate();
      runtime.commands.removeByUUID(command.uuid);
      socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", command.uuid);
    }
  }
}
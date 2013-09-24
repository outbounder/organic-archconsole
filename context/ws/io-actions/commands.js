var CommandResult = require("../models/CommandResult");
var Command = require("../models/Command");
var runtime = require("../models/runtime");
var path = require("path");
var fs = require("fs");
var Format = require("../models/OutputFormat");

var id = 0;
var uuid = function () {
  return String(id++);
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = function(config){
  var format = new Format();

  return {
    "POST /execute": function(data, callback, socket){
      var shell = runtime.shells.findByUUID(data.shelluuid);
      if(!shell || !data.value || data.value.length == 0) {
        callback(new Error("could start"));
        return;
      }

      var command = new Command(data);
      command.shell = shell;
      command.uuid = data.uuid || uuid();
      command.cwd = command.cwd || shell.cwd;
      
      shell.runningCommand = command;
      runtime.commands.push(command);

      callback(command.toJSON());

      if(command.value.length == 0) {
        socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", {uuid: command.uuid, code: 1});
        return;
      }

      if(command.value.indexOf("cd ") === 0) {   
        var target = data.value.replace("cd ","");   
        if(target.indexOf("~") === 0)     
          target = target.replace("~", getUserHome());   
        if(target.indexOf(".") === 0 || (target.indexOf("/") !== 0 && target.indexOf(":\\") !== 1))     
          target = path.normalize(path.join(shell.cwd, target));   
        fs.exists(target, function(e){     
          if(e) { 
            shell.cwd = target;
            socket.emit(command.shelluuid+"/"+command.uuid+"/output", shell.cwd);
            socket.emit(shell.uuid+"/updated", shell.toJSON());
            socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", 
              {uuid: command.uuid, code: 0});     
          } else {
            socket.emit(command.shelluuid+"/"+command.uuid+"/output", "not found");
            socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", 
              {uuid: command.uuid, code: 1});     
          }   
        }) 
      } else
      if(command.value.indexOf("pwd") === 0) {
        socket.emit(command.shelluuid+"/"+command.uuid+"/output", shell.cwd);
        socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", {uuid:
        command.uuid, code: 0}); } else {   command.start();
    
          command.stdout.on("data", function(data){
            if(data.toString().indexOf("<iframe") !== -1)
              socket.emit(command.shelluuid+"/"+command.uuid+"/output", data.toString());
            else
              socket.emit(command.shelluuid+"/"+command.uuid+"/output", format.escapeUnixText(data));
          });

          command.stderr.on("data", function(chunk){
            socket.emit(command.shelluuid+"/"+command.uuid+"/output", format.escapeUnixText(chunk));
          });

          command.childProcess.on("close", function(code, signal){
            if(command.childTerminateSiled) return;
            socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", {
              uuid: command.uuid,
              code: code
            });
          });
      }
    },
    "POST /terminate": function(data, callback, socket){
      var command = runtime.commands.findByUUID(data.uuid);
      if(!command)
        return;

      command.terminate();
      runtime.commands.removeByUUID(command.uuid);
      socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", command.uuid);
      if(callback) callback();
    }
  }
}
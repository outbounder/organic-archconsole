module.exports = function(c, next) {
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
}
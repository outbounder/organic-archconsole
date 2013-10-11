var path = require("path")
var fs = require('fs')

function getUserHome(env) {
  return env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

module.exports = function(c, next) {
  var target = c.command.value.replace("cd ","");
  var shell = c.command.shell
  var socket = c.socket

  if(target.indexOf("~") === 0)
    target = target.replace("~", getUserHome(shell.env));
  if(target.indexOf(".") === 0 || (target.indexOf("/") !== 0 && target.indexOf(":\\") !== 1))
    target = path.normalize(path.join(shell.cwd, target));

  fs.exists(target, function(e){
    if(e) {
      shell.setCwdAndNotify(target);
      c.output(shell.cwd);
      socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
      c.terminate()
    } else {
      c.output("not found");
      c.terminate(1)
    }
  })
}

var path = require('path')
var _ = require("underscore")

module.exports = function(c, next){
  var socket = c.socket
  var command = c.command
  var shell = c.command.shell
  if(command.value.indexOf(" ") === -1) return c.output("<p>usage: nvm "+shell.currentNodeVersion+"</p>").terminate()
  var nodeVersion = command.value.split(" ").pop()
  var envPATHparts = shell.env.PATH.split(path.delimiter)
  var nvmPath = _.find(envPATHparts, function(p){
    return p.indexOf(".nvm/") !== -1
  })
  var new_nvm_path = nvmPath.replace(shell.currentNodeVersion, nodeVersion)
  shell.currentNodeVersion = nodeVersion
  var new_path_parts = _.reject(envPATHparts, function(s){return s == nvmPath})
  new_path_parts.splice(0, 0, new_nvm_path)
  shell.env.PATH = new_path_parts.join(path.delimiter)
  c.output("<p> using "+nodeVersion+"</p>")
  c.terminate()
}

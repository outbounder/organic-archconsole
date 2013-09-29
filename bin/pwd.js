module.exports = function(c, next){
  var socket = c.socket
  var command = c.command
  var shell = c.command.shell
  c.output(shell.cwd);
  c.terminate()
}

module.exports = function(c, next){
  var socket = c.socket
  var command = c.command
  var shell = c.command.shell
  c.output("<pre>"+JSON.stringify(shell.env, null, 4)+"</pre>");
  c.terminate()
}

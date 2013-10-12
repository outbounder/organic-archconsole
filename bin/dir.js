var fs = require('fs')
module.exports = function(c, next){
  var socket = c.socket
  var command = c.command
  var shell = c.command.shell
  fs.readdir(shell.cwd, function(err, files){
	files.forEach(function(file){
	  c.output(file+"<br />")
	})
	c.terminate()
  })
}

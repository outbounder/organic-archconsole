var path = require("path")
var fs = require('fs')
var exec = require("child_process").exec


module.exports = function(c, next){
  var editorOfChoice = "atom"
  var child = exec(editorOfChoice, {
    env: c.command.shell.env,
    cwd: c.command.shell.cwd,
    detached: true,
    stdio: [ 'ignore', 'ignore', 'ignore' ]
  })
  child.unref()
  c.terminate()
}
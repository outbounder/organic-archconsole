var path = require("path")
var fs = require('fs')

module.exports = function(c, next) {

  c.output("<p>press 'ctlr+space' to run git status </p>")

  c.bindKeyOnce("ctrl+space", "git status", function(code, cmd){
    c.terminate()
  })
  
}

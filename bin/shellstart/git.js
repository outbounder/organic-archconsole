var path = require("path")
var fs = require('fs')

module.exports = function(c, next) {

  c.output("<p>press 'alt+shift+g' to run git status </p>")
  c.output("<p>press 'ctrl+shift+space' to sync with git</p>")

  c.bindKey("alt+shift+g", "git status")
  c.bindKey("ctrl+shift+space", "git pull && git push")
  c.terminate()
}

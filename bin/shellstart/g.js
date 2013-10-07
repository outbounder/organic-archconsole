var path = require("path")
var fs = require('fs')

module.exports = function(c, next) {

  c.output("<p>press 'alt+shift+g' to run git status </p>")

  c.bindKey("alt+shift+g", "git status")
  c.terminate()
}

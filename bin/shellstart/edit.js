var path = require("path")
var fs = require('fs')

module.exports = function(c, next) {

  c.output("<p>press 'alt+shift+e' to run subl editor at current directory</p>")

  c.bindKey("alt+shift+e", "subl ./")
  c.terminate()
}

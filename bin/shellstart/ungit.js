var path = require("path")
var fs = require('fs')

module.exports = function(c, next) {

  c.output("<p>press 'alt+shift+enter' to run ungit </p>")

  c.bindKey("alt+shift+enter", "ungit")
  c.terminate()
}

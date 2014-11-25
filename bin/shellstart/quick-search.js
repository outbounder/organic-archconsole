var path = require("path")
var fs = require('fs')

module.exports = function(c, next) {

  c.output("<p>press 'alt+shift+]' to run search via google-chrome</p>")
  c.output("<p>press 'alt+shift+\\' to open first search result via google-chrome </p>")

  c.bindKey("alt+shift+]", function(triggerCtx, next){
    var url = "https://www.google.bg/search?q="+encodeURI(triggerCtx.commandinput.value)
    c.execute("google-chrome "+url, function(){
      next({clearCommandInput: true})
    })
  })
  c.bindKey("alt+shift+\\", function(triggerCtx, next){
    var url = "https://www.google.bg/search?q="+encodeURI(triggerCtx.commandinput.value)+"&btnI"
    c.execute("google-chrome "+url, function(){
      next({clearCommandInput: true})
    })
  })
  c.terminate()
}

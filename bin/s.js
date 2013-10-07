var path = require("path")
var fs = require('fs')

var findPackageJSON = function(root, callback) {
  fs.exists(path.join(root,"package.json"), function(found){
    if(found)
      fs.readFile(path.join(root,"package.json"), function(err, packagejson){
        if(err) {console.error(err); return callback && callback()}
        try{
          callback(JSON.parse(packagejson))
        }catch(err){
          console.error(err)
          callback()
        }
      })
    else
      callback(null)
  })
}

var registerRunHandler = function(packagejson, c) {
  c.bindKeyOnce("r", "PORT=9999 node "+packagejson.main, function(){
    c.output("<p>running "+"node "+packagejson.main+"</p>")
    c.output("<p class='alert alert-success'>to stop press 'ctrl+shift+c'</p>")
    c.output("<hr />")
    c.terminate()
  })
}

module.exports = function(c, next) {

  findPackageJSON(c.command.cwd, function(packagejson){
    if(!packagejson) return next && next()

    c.output("<p>press 'r' to run with node "+packagejson.main+"</p>")
    c.output("<p>press 's' to release "+packagejson.name+"</p>")
    if(packagejson.scripts && packagejson.scripts.test)
      c.output("<p>press 't' to test "+packagejson.scripts.test+"</p>")
    c.output("<hr />")

    c.bindKeyOnce("t", "npm test", function(code, cmd){
      c.terminate()
    })

    registerRunHandler(packagejson, c)

    c.bindKeyOnce("s", function(){
      c.output("<p>shift+1 = to release on stagaing </p>")
      c.output("<p>shift+2 = to release on production </p>")
      c.output("<hr />")

      c.bindKeyOnce("shift+1", function(){
        c.output("<b>success</b>")
        c.terminate()
      })
    })
    
  })
  
}

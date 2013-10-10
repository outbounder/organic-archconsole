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

module.exports = function(c, next) {
  c.output("<p>press 'alt+shift+r' to run current as node </p>")
  c.output("<p>press 'alt+shift+t' to run current tests </p>")
  c.bindKey("alt+shift+r", function(){
    var shell = c.command.shell
    findPackageJSON(shell.cwd, function(packagejson){
      if(packagejson)
        c.execute("node "+packagejson.main)
    })
  })
  c.bindKey("alt+shift+t", function(){
    var shell = c.command.shell
    findPackageJSON(shell.cwd, function(packagejson){
      if(packagejson && packagejson.scripts && packagejson.scripts.test)
        c.execute(packagejson.scripts.test)
    })
  })
  c.terminate()
}

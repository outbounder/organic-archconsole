var url_parser = require("url")
var path = require("path")
var fs = require("fs")
var async = require("async")

var transformUrlToPath = module.exports.transformUrlToPath = function(root, url, replacement, next) {
  var urlpath = url_parser.parse(url).pathname // /s/n/something.extension

  var directFile = path
    .join(root, urlpath)
    .replace(replacement.pattern, replacement.value)
  
  var indexFile = path
    .join(root, path.dirname(urlpath), "index."+path.basename(urlpath) )
    .replace(replacement.pattern, replacement.value)
  
  async.detect([directFile, indexFile], fs.exists, next)
}

module.exports.init = function(plasma, config) {
  var root = path.join(process.cwd(), config.root)
  return function(c, next) {
    
    if(c.req.url.indexOf(config.extname) === -1)
      return next()


    transformUrlToPath(root, c.req.url, config.replacement || {pattern: "", value:""}, function(path){
      if(!path) return next()
      plasma.emit({
        type: config.emit.type,
        target: path,
        pipe: config.pipe
      }, function(bundle){
        c.res.writeHead(200,config.headers)
        if(bundle.pipe)
          bundle.pipe(c.res)
        else
          c.res.end(bundle.data)
      })
    })
  }
}
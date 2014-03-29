var path = require("path")
var fs = require('fs')
var _ = require("underscore")

var memory = {}
var memoryFilePath = process.cwd()+"/data/cd-memory.json"

var searchInMemory = function(term, match, next) {
  if(match.length == 0) return next(null, [])
  if(term.indexOf("cd") != 0) return next(null, [])
  if(term === "cd ") return next(null, [])

  var results = []
  for(var key in memory) {
    var target = key.split(path.sep).pop()
    if(target && target.indexOf(match) != -1)
      results.push({value: key, hits: memory[key]})
  }
  results = _.sortBy(results, function(entry){
    return entry.hits
  }).map(function(entry){
    return {value: "*"+entry.value, match: "cd "+entry.value, full: true}
  })
  next(null, results)
}

var rememberCwd = function(cwd) {
  if(!memory[cwd])
    memory[cwd] = 0
  memory[cwd] += 1
  fs.writeFile(memoryFilePath, JSON.stringify(memory), function(err){
    if(err)
      console.log(err)
  })
}

var boot = function(c, next) {
  var shell = c.command.shell
  shell.autocompleteProviders.push(searchInMemory)
  shell.on('cwd:changed', function(){
    rememberCwd(shell.cwd)
  })
  c.terminate()
}

module.exports = function(c, next) {
  fs.exists(memoryFilePath, function(found){
    if(found) {
      fs.readFile(memoryFilePath, function(err, content){
        memory = JSON.parse(content.toString())
        boot(c, next)
      })
    } else
      boot(c, next)
  })
}
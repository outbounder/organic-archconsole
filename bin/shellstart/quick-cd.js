var path = require("path")
var fs = require('fs')
var _ = require("underscore")

var memory = {}
var memoryFilePath = process.cwd()+"/data/cd-memory.json"

var searchInMemory = function(term, next) {
  var results = []
  for(var key in memory) {
    var target = key.split(path.sep).pop()
    if(target && target.indexOf(term) != -1)
      results.push({value: key, hits: memory[key]})
  }
  results = _.sortBy(results, function(entry){
    return entry.hits
  }).reverse().map(function(entry){
    return {
      value: "*"+entry.value, 
      match: "cd "+entry.value, 
      full: true,
      execute: {isPTY: false}
    }
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
  shell.on('cwd:changed', function(){
    rememberCwd(shell.cwd)
  })
  c.output("<p>press 'ctrl+alt+z' to cd into visited directiry </p>")

  c.bindKey("ctrl+alt+z", function(triggerCtx){
    searchInMemory(triggerCtx.commandinput.value, function(err, data){
      c.socket.emit("/autocomplete/results", data)  
    })
  })
  c.socket.on("/autocomplete/results", function(data, callback){
    searchInMemory(data.term, function(err, data){
      callback(data)
    })
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
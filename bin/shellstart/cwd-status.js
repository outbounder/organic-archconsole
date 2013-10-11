var path = require("path")
var fs = require('fs')
var monocle = require('monocle')()
var gift = require("gift")

module.exports = function(c, next) {
  var shell = c.command.shell
  shell.on("cwd:changed", function(){
    monocle.unwatchAll()
    repo = gift(shell.cwd)
    repo.status(function(err, status){
      shell.git_status = status
      c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
    })
    monocle.watchDirectory({
      root: shell.cwd,
      listener: function(changed){
        repo.status(function(err, status){
          shell.git_status = status
          c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
        })
      },
      complete: function(){
      }
    })
  })
  c.output("<p>when current working directory is changed, watcher for git status will be assigned</p>")
  c.terminate()
}

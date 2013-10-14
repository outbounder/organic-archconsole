var path = require("path")
var fs = require('fs')
var gift = require("gift")
var _ = require("underscore")
var gaze = require("gaze")

module.exports = function(c, next) {
  var shell = c.command.shell
  var timeoutID;
  var updateRunning = false
  var watcher;
  var startOnceWrap = function(fn, interval) {
    return function(){
      if(timeoutID)
        clearTimeout(timeoutID)
      timeoutID = setTimeout(fn, interval)
    }
  }
  var cleanUp = function(){
    if(watcher) {
      watcher.close()
      watcher = null
    }
    if(timeoutID) {
      clearTimeout(timeoutID)
      timeoutID = null
    }
  }
  shell.on("terminated", function(){
    cleanUp()
  })
  shell.on("cwd:changed", function(){
    cleanUp()

    fs.exists(path.join(shell.cwd,".git"), function(found){
      if(!found) {
        shell.git_head = null
        shell.git_status = null
        shell.git_sync = false
        shell.git_remotes = null
        c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
        return
      }

      repo = gift(shell.cwd)
      var updateShell = function(){
        if(updateRunning) return
        updateRunning = true
        console.log("UPDATING STATUS")
        repo.status(function(err, status){
          shell.git_status = status
          repo.branch(function(err, head){
            shell.git_head = head
            repo.remotes(function(err, remotes){
              shell.git_remotes = remotes
              var remote = _.find(remotes, function(r){ return r.name == "origin/"+head.name})
              shell.git_sync = remote.commit.id == head.commit.id
              updateRunning = false
              c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
            })
          })
        })
      }
      updateShell()

      watcher = gaze(shell.cwd+"/**/*",{interval: 2500})
      watcher.on('all', startOnceWrap(function(){
        updateShell()
      }, 1000))
    })
  })
  c.output("<p>when current working directory is changed, watcher for git status will be assigned</p>")
  c.terminate()
}

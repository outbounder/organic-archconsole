var path = require("path")
var fs = require('fs')
var gift = require("gift")
var _ = require("underscore")

module.exports = function(c, next) {
  var shell = c.command.shell
  var intervalID;
  var updating = false
  var cleanupShellStatus = function(){
    shell.git_head = null
    shell.git_status = null
    shell.git_sync = null
    shell.git_remotes = null
    c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
  }
  var updateShell = function(){
    if(updating) return
    updating = true
    fs.exists(path.join(shell.cwd,".git"), function(found){
      if(!found) {
        cleanupShellStatus()
        updating = false
        return
      }
      repo = gift(shell.cwd)
      repo.status(function(err, status){
        shell.git_status = status
        repo.branch(function(err, head){
          shell.git_head = head
          repo.remotes(function(err, remotes){
            shell.git_remotes = remotes
            var remote = _.find(remotes, function(r){ return r.name == "origin/"+head.name})
            if(remote)
              shell.git_sync = remote.commit.id == head.commit.id
            c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
            updating = false
          })
        })
      })
    })
  }
  var stopLongPolling = function(){
    if(intervalID)
      clearInterval(intervalID)
    intervalID = null
    updating = false
  }
  var startLongPolling = function(){
    stopLongPolling()
    intervalID = setInterval(updateShell, 10000)
  }
  shell.on("terminated", function(){
    stopLongPolling()
  })
  shell.on('cwd:changed', function(){
    startLongPolling()
    updateShell()
  })
  c.bindKey("ctrl+shift+space", function(){
    startLongPolling()
    updateShell()
  })
  c.output("<p>press ctrl+shift+space to trigger current working directory status sync</p>")
  c.terminate()
}

var path = require("path")
var fs = require('fs')
var monocle = require('monocle')()
var gift = require("gift")
var _ = require("underscore")

module.exports = function(c, next) {
  var shell = c.command.shell
  shell.on("cwd:changed", function(){
    monocle.unwatchAll()
    fs.exists(path.join(shell.cwd,".git"), function(found){
      if(!found) {
        shell.git_head = null
        shell.git_status = null
        c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
        return
      }

      repo = gift(shell.cwd)
      var updateShell = function(){
        repo.status(function(err, status){
          shell.git_status = status
          repo.branch(function(err, head){
            shell.git_head = head
            repo.remotes(function(err, remotes){
              shell.git_remotes = remotes
              var remote = _.find(remotes, function(r){ return r.name == "origin/"+head.name})
              shell.git_sync = remote.commit.id == head.commit.id
              c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
            })
          })
        })
      }
      updateShell()
      monocle.watchDirectory({
        root: shell.cwd,
        listener: function(changed){
          updateShell()
        },
        complete: function(){
        }
      })
    })
  })
  c.output("<p>when current working directory is changed, watcher for git status will be assigned</p>")
  c.terminate()
}

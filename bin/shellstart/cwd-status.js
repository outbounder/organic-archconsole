var path = require("path")
var fs = require('fs')
var gift = require("gift")
var _ = require("underscore")

module.exports = function(c, next) {
  var shell = c.command.shell
  shell.on('cwd:changed', function(){
    shell.git_head = null
    shell.git_status = null
    shell.git_sync = null
    shell.git_remotes = null
    c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
  })
  c.bindKey("ctrl+shift+space", function(){
    fs.exists(path.join(shell.cwd,".git"), function(found){
      if(!found) {
        shell.git_head = null
        shell.git_status = null
        shell.git_sync = null
        shell.git_remotes = null
        c.socket.emit("/shells/updated", {uuid: shell.uuid, value: shell.toJSON()});
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
          })
        })
      })
    })
  })
  c.output("<p>press ctrl+shift+space to trigger current working directory status sync</p>")
  c.terminate()
}

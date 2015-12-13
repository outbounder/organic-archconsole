var gift = require("gift")
var path = require("path")
var fs = require('fs')

module.exports = function(c, next) {

  c.output("<p>press 'alt+shift+g' to run git status </p>")
  c.output("<p>press 'alt+shift+p' to run git pull origin {currentBranchName} </p>")
  c.output("<p>press 'alt+shift+u' to run git push origin {currentBranchName} </p>")
  c.output("<p>press 'alt+shift+e' to run git rebase origin/{currentBranchName} </p>")

  c.bindKey("alt+shift+g", "git status")
  c.bindKey("alt+shift+p", function(){
    repo = gift(c.command.shell.cwd)
    repo.branch(function(err, head){
      c.execute("git pull origin "+head.name)
    })
  })
  c.bindKey("alt+shift+u", function(){
    repo = gift(c.command.shell.cwd)
    repo.branch(function(err, head){
      c.execute("git push origin "+head.name)
    })
  })
  c.bindKey("alt+shift+e", function(){
    repo = gift(c.command.shell.cwd)
    repo.branch(function(err, head){
      c.execute("git rebase origin/"+head.name)
    })
  })
  c.terminate()
}

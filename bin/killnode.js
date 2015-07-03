
var exec = require("child_process").exec
var path = require('path')
var _ = require("underscore")

var render = function(command, nodeInfos) {
  return nodeInfos.map(function(node){
    return "<button onclick='killPid("+node.pid+")' data-pid='"+node.pid+"' style='text-align: left'><span style='text-overflow: ellipsis; width: 460px; overflow: hidden; white-space: nowrap; display: block;'>"+node.pid+" "+node.title+"</span></button>"
  }).join("<br />")
}

var refreshNodeInfos = function(command, done) {
  exec("ps aux | grep node", {
    env: command.shell.env,
    cwd: command.shell.cwd
  }, function(err, stdout, stderr){
    if(err) return done(err)
    var nodeInfos = stdout.split("\n").map(function(node){
      var columns = _.compact(node.split(" "))
      if(!columns[1])
        return null
      return {
        pid: columns[1],
        title: columns.slice(10).join(" ")
      }
    })
    done(err, _.compact(nodeInfos))
  })
}

module.exports = function(c, next){
  var socket = c.socket
  var command = c.command
  var shell = c.command.shell
  
  
  c.output("<p>looking for node processes...</p>")
  c.output([
    "<script>",
    "var killPid = function(pid){",
      "archconsole.emit('/commands/"+command.uuid+"/input', pid, function(data){",
        "$('#"+command.uuid+"').html(data)",
      "})",
    "}",
    "var update = function(data){",
      "archconsole.emit('/commands/"+command.uuid+"/input', 'update', function(data){",
        "$('#"+command.uuid+"').html(data)",
      "})",
    "}",
    "</script>"
  ].join("\n"))
  c.output("<button onclick='update()'>refresh</button>")
  
  var inputHandler = function(data, callback){
    if(data == "q") {
      socket.removeListener("/commands/"+command.uuid+"/input", inputHandler)
      return c.terminate()
    }
    if(data == "update") {
      return refreshNodeInfos(command, function(err, nodeInfos){
        if(err) {
          c.output(err)
          return c.terminate()
        }
        callback(render(command, nodeInfos))
      })
    }
      
    try {
      var pidToKill = parseInt(data)
      process.kill(pidToKill, "SIGINT")
    }catch(err){
      c.output(err)
    }
    
    refreshNodeInfos(command, function(err, nodeInfos){
      if(err) {
        c.output(err)
        return c.terminate()
      }
      callback(render(command, nodeInfos))
    })
  }
  socket.on("/commands/"+command.uuid+"/input", inputHandler)
  
  refreshNodeInfos(command, function(err, nodeInfos){
    if(err) {
      c.output(err)
      return c.terminate()
    }
    c.output("<div id='"+command.uuid+"'>"+render(command, nodeInfos)+"</div>")
  })
}

var path = require("path");
var fs = require("fs");
var switchByEventname = require("organic-alchemy").ws.switchByEventname
var chain = require("organic-alchemy").ws.chain
var async = require('async')

var createCommandContext = require("models/server/ArchConsoleCommandContext")
var Command = require("models/server/Command");
var OutputFormat = require("models/server/OutputFormat");
var format = new OutputFormat()

var LocalCommands = require("models/server/LocalCommands");
var localCommands = new LocalCommands()
localCommands.load({ root: path.join(process.cwd(), "bin") })

var runtime = require("models/server/runtime");
var _ = require("underscore")

var id = 0;
var uuid = function () {
  return String(id++);
}

var splitByCommand = function(execCmd /* Reaction for executing a command */){
  return function(c, parent) {
    // split the command's value by AND and execute each as single command
    async.eachSeries(c.data.value.split("&&"), function(cmd, next){

      // split the command's value by OR with support of piping ->
      // firstCommand.output is piped to secondCommand.input
      if(cmd.indexOf("|") != -1) {

        // pointer to firstCommand in a row
        var cmdSource = null

        // each command in a row is executed by the execCmd Reaction
        var lastcmd = cmd.split("|").pop()
        async.eachSeries(cmd.split("|"), function(cmdOrigin, n){

          // create extendedC chemical for triggering new command reaction
          // and set value of the current command to be executed
          var extendedC = _.extend({}, c)
          extendedC.data.value = cmdOrigin
          extendedC.pipeToClients = cmdOrigin == lastcmd
          execCmd(extendedC, function(){
            // if there is firstCommand started pipe its outp/ut to current one from the row
            if(cmdSource && cmdSource.command.stdout)
              cmdSource.command.stdout.pipe(extendedC.command.stdin)
            cmdSource = extendedC
            n()
          })
        }, next)
      } else {
        var extendedC = _.extend({}, c)
        extendedC.data.value = cmd
        extendedC.pipeToClients = true
        extendedC.pipeInputFromClients = true
        execCmd(extendedC, function(err){
          if(err instanceof Error) return next(err)
          next()
        })
      }
    }, function(err){
      if(err) c.err = err
      parent && parent()
    })
  }
}

var prepareAsCommand = function(c, next) {
  var shell = runtime.shells.findByUUID(c.data.shelluuid);
  if(!shell || !c.data.value)
    return next && next(new Error("can not start without shell or without value"))

  var command = new Command(c.data);
  command.shell = shell;
  command.uuid = uuid();
  command.cwd = command.cwd || shell.cwd;
  c.command = command
  shell.runningCommand = command;
  runtime.commands.push(command);
  next && next()
}

var aggregateEnvVars = function(c, next){
  var pattern = /([A-Z_]+=[a-zA-Z0-9]+)+/g
  var envVars = c.command.value.match(pattern)
  if(envVars) {
    for(var i = 0; i<envVars.length; i++) {
      var pairs = envVars[i].split("=")
      var variable = {}
      variable[pairs[0]] = pairs[1]
      _.extend(c.command.env, variable)
      c.command.value = c.command.value.replace(envVars[i]+" ", "")
    }
  }
  next && next()
}


var executeCommand = function(c, next) {
  var shell = c.command.shell

  var cmdExecutable = c.command.value.split(" ").shift()
  if(localCommands.findByName(cmdExecutable)) {
    c.command.isPTY = false
    c.socket.emit("/shells/commandstart", {uuid: shell.uuid, value: c.command.toJSON()})
    localCommands.executeByName(cmdExecutable, createCommandContext(c))
  } else {
    c.socket.emit("/shells/commandstart", {uuid: shell.uuid, value: c.command.toJSON()})
    c.command.start()
  }

  next && next()
}

var pipeOutputToClients = function(c, next){
  var command = c.command
  if(c.pipeToClients && (command.stdout || command.stderr)) {
    var emit = function(data) {
      if(command.isPTY)
        c.socket.emit("/commands/output", {uuid: command.uuid, value: data})
      else
        c.socket.emit("/commands/output", {uuid: command.uuid, value: format.escapeUnixText(data)})
    }
    if(command.stdout)
      command.stdout.on("data", emit);
    if(command.stderr)
      command.stderr.on("data", emit);
  }
  next && next()
}

var pipeTerminatedToClients = function(c, next){
  if(c.command.childProcess) {
    c.command.childProcess.on("exit", function(code, signal){
      c.command.code = code
      c.command.signal = signal
      c.socket.emit("/commands/terminated", { uuid: c.command.uuid, code: c.command.code })
    });
  }
  next && next()
}

var pipeInputFromClients = function(c, next) {
  if(c.pipeInputFromClients && c.command.stdin) {
    var writeInput = function(keyChar){
      if(c.command.stdin.writable)
        c.command.stdin.write(keyChar)
    }
    c.socket.on("/commands/"+c.command.uuid+"/input", writeInput)
    c.command.childProcess.on("exit", function(){
      c.socket.removeListener("/commands/"+c.command.uuid+"/input", writeInput)
    })
  }
  next && next()
}

var execute = module.exports.execute =
  splitByCommand(
    chain(
      prepareAsCommand,
      aggregateEnvVars,
      executeCommand,
      pipeOutputToClients,
      pipeTerminatedToClients,
      pipeInputFromClients
    )
  )

module.exports.aggregateEnvVars = aggregateEnvVars

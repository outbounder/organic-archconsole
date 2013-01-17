var _ = require("underscore");
var exec = require("child_process").exec;
var CommandResult = require("./CommandResult");
var path = require("path");

module.exports = function(data){
  _.extend(this, data);
}

module.exports.prototype.toJSON = function(){
  return {
    uuid: this.uuid,
    shelluuid: this.shelluuid,
    value: this.value
  }
}

module.exports.prototype.start = function(archconsole){
  
  var parts = this.value.split(" ");
  var cmd = parts.shift();

  var self = this;
  path.exists(__dirname+"/../../commands/"+cmd+".js", function(exists){

    var options = {
      cwd: self.shell.cwd,
      env: self.shell.env,
      encoding: "binary"
    };

    if(exists){
      var Command = require(__dirname+"/../../commands/"+cmd+".js");
      self.childProcess = new Command();
    } else {
      console.log(options);
      self.childProcess = exec(self.value, options);
    }

    self.stdin = self.childProcess.stdin;
    self.stdout = self.childProcess.stdout;
    self.stderr = self.childProcess.stderr;
    self.commandResult = new CommandResult();

    
    self.stdout.on("data", function(chunk){
      self.commandResult.append(chunk);
      archconsole.emit("archconsole::ui::"+self.shelluuid+"::"+self.uuid+"::execute::stdout", chunk);
    });

    self.stderr.on("data", function(chunk){
      self.commandResult.append(chunk);
      archconsole.emit("archconsole::ui::"+self.shelluuid+"::"+self.uuid+"::execute::stderr", chunk);
    });

    self.childProcess.on("close", function(code, signal){
      self.childProcess.exited = true;
      var data = self.commandResult.outputData();
      archconsole.emit("archconsole::ui::"+self.shelluuid+"::"+self.uuid+"::execute::data", data);
      archconsole.emit("archconsole::ui::"+self.shelluuid+"::"+self.uuid+"::execute::terminate", self.uuid);
    });

    if(exists)
      self.childProcess.run(parts.join(" "), options, self.shell, archconsole);
  });
}

module.exports.prototype.terminate = function(archconsole){
  if(!this.childProcess.exited)
    this.childProcess.kill();
  this.childProcess = null;
  this.stdin = this.stderr = this.stdout = null;
}
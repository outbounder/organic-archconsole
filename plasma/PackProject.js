var organic = require("organic");
var shelljs = require("shelljs");

module.exports = organic.Organel.extend(function PackProject(plasma, config){
  organic.Organel.call(this, plasma, config);

  var arch = require("../package.json");

  this.on("PackProject", function(c, sender, callback){
    shelljs.mkdir('-p', process.cwd()+"/build");
    var target = process.cwd()+"/build/archconsole-v"+arch.version+".zip";
    var cmd = 'zip -0 '+target+' -r . -x "*CVS*" "*Thumbs.db*" "*.svn*" "*node_modules*" "*js.err" "*js.out" "*.git*" "*build*"';
    var result = shelljs.exec(cmd);
    callback(result);
  })
})
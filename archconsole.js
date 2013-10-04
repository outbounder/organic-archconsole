var util = require("util");
var DNA = require("organic").DNA;
var Plasma = require("organic").Plasma;
var Cell = require("organic").Cell;

process.env.CELL_MODE = process.env.CELL_MODE || "development";

module.exports = function() {
  var self = this;

  self.plasma = new Plasma();

  var dna = new DNA();
  dna.loadDir(process.cwd()+"/dna", function(){
    if(dna[process.env.CELL_MODE])
      dna.mergeBranchInRoot(process.env.CELL_MODE);
    if(process.env.PORT)
      dna.membrane.HttpServer.port = process.env.PORT

    Cell.call(self, dna);

    self.plasma.emit({type: "build", branch: "membrane"}); // build membrane organelles
    self.plasma.emit({type: "build", branch: "plasma"}); // build plasma organelles
  });
}

util.inherits(module.exports, Cell);


module.exports.prototype.kill = function(){
  this.plasma.emit("kill");
}


// start the cell if this file is not required
if(!module.parent)
  new module.exports();
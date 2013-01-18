var shells = [];
shells.findByUUID = function(uuid) {
  for(var i = 0; i<this.length; i++)
    if(this[i].uuid == uuid)
      return this[i];
}
shells.removeByUUID = function(uuid) {
  for(var i = 0; i<this.length; i++)
    if(this[i].uuid == uuid) {
      this.splice(i,1);
      return;
    }
}

var commands = [];
commands.findByUUID = function(uuid){
  for(var i = 0; i<this.length; i++)
    if(this[i].uuid == uuid)
      return this[i];
}
commands.removeByUUID = function(uuid){
  for(var i = 0; i<this.length; i++)
    if(this[i].uuid == uuid) {
      this.splice(i,1);
      return;
    }
}


module.exports.shells = shells;
module.exports.commands = commands;
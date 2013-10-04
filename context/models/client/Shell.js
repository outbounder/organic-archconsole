var Command = require("./Command");
var _ = require("underscore")

module.exports = Backbone.Model.extend({
  createNewCommand: function(data){
    var command = new Command({
      shelluuid: this.get('uuid')
    });
    return command;
  }
});
var fs = require('fs');
var path = require("path");
var jade = require("jade");

module.exports = function(client, config) {
  client.bundle.transform(function(file){
    if (!/\.jade$/.test(file)) return client.through();

    var buffer = "";

    return client.through(function(chunk) {
      buffer += chunk.toString();
    },
    function() {
      var compiled = "module.exports = " + jade.compile(buffer.toString(),{
        filename: file,
        client: true,
        compileDebug: config.debug || false
      }).toString() + "\n";
      this.queue(compiled);
      this.queue(null);
    });
  });
}
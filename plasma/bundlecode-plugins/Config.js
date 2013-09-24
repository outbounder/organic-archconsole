module.exports = function(client, config) {
  client.bundle.require(__dirname+"/../../dna/"+process.env.CELL_MODE+"/client.json", {expose: "config"});
}
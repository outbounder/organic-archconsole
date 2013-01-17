module.exports = Backbone.View.extend({
  initialize: function(){
  },
  render: function(){
    this.$(".menuContainer").html(require("../templates/menu.jade"));
    this.$(".statusbarContainer").html(require("../templates/statusbar.jade"));
    $("#status-cwd").html(this.model.get("cwd"));
    $("#status-time").html(this.model.get("time"));
    return this;
  }
});
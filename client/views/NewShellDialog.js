module.exports = Backbone.View.extend({
  events: {
    "click a[data-dismiss='modal']": "remove",
    "click button[data-dismiss='modal']": "remove",
    "click #createBtn": "createNewShell"
  },
  initialize: function(){
    this.$el = $(require("../templates/newShellDialog.jade"));
  },
  createNewShell: function(){
    this.trigger("createNewShell",{
      name: this.$("#name").val(),
      host: this.$("#host").val() || "localhost",
      username: this.$("#username").val() || "",
      password: this.$("#password").val() || ""
    });
  },
  render: function(){
    $("body").append(this.$el);
  }
})
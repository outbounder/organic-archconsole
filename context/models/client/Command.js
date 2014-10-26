var moment = require("moment")

module.exports = Backbone.Model.extend({
  getTimestampStr: function(){
    return moment(this.get("startedAt")).format("Do, h:mm:ss a")
  }
});
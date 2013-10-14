var p = require("platform")
var platform = {
  os: "unknown"
}
if(p.os.family.toLowerCase() == "darwin")
  platform.os = "mac unix"
  else
    if(p.os.family.toLowerCase().indexOf("win") != -1)
      platform.os = "win"
      else
        if(p.os.family.toLowerCase().indexOf("linux") != -1)
          platform.os = "linix unix"
module.exports = platform

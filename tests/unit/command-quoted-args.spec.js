describe("command quoted args", function(){
  var Command = require("models/server/Command")
  it("joins quoted args correctly", function(){
    var args = ["arg1", "-m"].concat(('"quoted with a message"'.split(" ")))
    Command.joinQuotedArgs(args)
    expect(args.length).toBe(3)
    expect(args[2]).toBe("quoted with a message")
  })
})
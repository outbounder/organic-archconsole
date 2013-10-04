describe("command and env vars", function(){
  var aggregateEnvVars = require("../../context/ws/reactions/command").aggregateEnvVars
  it("extracts env var correctly", function(){
    var mockUpC = {
      command: {
        value: "PORT=test node server.js",
        env: {}
      }
    }
    aggregateEnvVars(mockUpC, function(){
      expect(mockUpC.command.env.PORT).toBe("test")
    })
  })

  it("extracts env vars correctly", function(){
    var mockUpC = {
      command: {
        value: "PORT=test CELL_MODE=test S=9 node server.js",
        env: {}
      }
    }
    aggregateEnvVars(mockUpC, function(){
      expect(mockUpC.command.env.PORT).toBe("test")
      expect(mockUpC.command.value).toBe("node server.js")
    })
  })

  it("extracts env vars without confusion", function(){
    var mockUpC = {
      command: {
        value: "node server.js port=test",
        env: {}
      }
    }
    aggregateEnvVars(mockUpC, function(){
      expect(mockUpC.command.env.port).not.toBe("test")
    })
  })
})
module.exports = function(c, next) {
  if(c.req.url == "/")
    c.res.end(jadefy("../../ui/pages/index.jade", module)())
  else
    next()
}
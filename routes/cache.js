var mcache = require('memory-cache');

var cache = (duration) => {
    console.log('In cache');
    return (req, res, next) => {
      let key = '__express__' + req.originalUrl || req.url
      console.log("Key is:- ",key);
      let cachedBody = mcache.get(key)
      
      if (cachedBody) {
        console.log("Sent Cached Body");
        res.send(cachedBody)
        return
      } else {
        console.log("Sent Non Cached Body");
        res.sendResponse = res.send
        res.send = (body) => {
          mcache.put(key, body, duration * 1000);
          res.sendResponse(body)
        }
        next()
      }
    }
  }

  module.exports = { cache };
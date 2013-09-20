
  // app.js

  var express = require('express')
  //, domain  = require('domain')
    , http    = require('http')
    , sio     = require('socket.io')
  //, MD5     = require('crypto-js/md5')
    , Tile    = require('./lib/Tile')
    , app     = express()

  app.configure(function() {
    app.use(express.cookieParser())
    app.use(express.session({secret: 'secret', key: 'express.sid'}))
  })

  app.set('port', process.env.PORT || 8000)
  app.use(express.favicon())
  app.use(express.static(__dirname + '/public'))

  var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('   Express server listening on port ' + app.get('port'))
  })

  var io = sio.listen(server)

  io.configure(function() {
    io.set('transports', ['websocket'])
    io.disable('log')
    io.set('authorization', function(handshakeData, cb) {
      cb(null, true)
    })
  })

  // events
  io.sockets.on('connection', eventHandler)

  var fluid = 1.4  /** defaults to 1.5 minimum **/

  function eventHandler(socket) {
    //var id = MD5(socket.id).toString()
    //console.log('New client: #%s, #%s', id.substr(0, 6), id.substr(-6))

    // initial connection
    socket.emit('newTile', new Tile().size(16).addNoise().addBlur())

    // tile requested
    socket.on('getTile', function () {
      var tile = new Tile().size(16).addNoise().addBlur(fluid)
      console.log('   > tile sent (%d% fluid)', tile.fluidRatio())
      socket.emit('newTile', tile)
      fluid += 0.01
    })
  }


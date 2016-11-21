var API = require('./logic/api.js')
var Datastore = require('./logic/datastore.js')
var http = require('http');
var api = new API()

var db = new Datastore(function(error) {
//We need a function which handles requests and send response
  function handleRequest(request, response){
    // Fetching data every time is not be necessary 
    fetchData()
    .then(db.save)
    .then(function() {
      // get data from the datastore
      db.getLivestreams()
      .then(function(events) {
        response.end(JSON.stringify(events))
      })
    })
    .catch(function(err) {
      response.end('Failed to fetch data: ' + err)
    })

  }
  var server = http.createServer(handleRequest)

//Lets start our server
  server.listen(8080, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", 8080)
  });

  var fetchData = function() {
    var promise = new Promise(function(resolve, reject) {
      api.fetchLiveData()
      .then(function(data) {
        var titles = []
        for (obj of data) {
          if(titles.indexOf(obj.podcast) < 0) {
            titles.push(obj.podcast)
          }
        }
        channelTitleHandling(titles)
        .then(saveEvents(data))
        .then(resolve)
      })
      // .then(saveEvents(data))
      .catch(reject)
    })
    return promise
  }

  var channelTitleHandling = function(channelTitles) {
    var promise = new Promise(function(resolve, reject) {
      var _promises = []
      for (title of channelTitles) {
        var _promise = saveChannelIfNeeded(title)
        _promises.push(_promise)
      }
      Promise.all(_promises)
      .then(resolve)
      .catch(reject)
    })
    return promise
  }

  var saveChannelIfNeeded = function(title) {
    var promise = new Promise(function(resolve, reject) {
      db.getChannel(title)
      .then(function(obj){
        if (obj === null) {
          api.fetchChannel(title)
          .then(function(channel) {
            console.log('fethed channel from api');
            db.saveChannel(channel)
            .then(resolve)
          })
        } else {
          console.log('Channel is stored already');
          resolve()
        }
      })
      .catch(reject)
    });
    return promise
  }

  var saveEvents = function(events) {
    var promise = new Promise(function(resolve, reject) {
      db.saveEvents(events)
      .then(resolve)
      .catch(reject)
    })
    return promise
  }
})

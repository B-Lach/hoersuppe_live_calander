var API = require('./logic/api.js')
var Datastore = require('./logic/datastore.js')

var api = new API()
var db = new Datastore(function(error) {

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

  // Fetching data handling
  fetchData()
  .then(db.save)
  .then(function() {
    // get data from the datastore
    db.getLivestreams()
    .then(function(events) {
      console.log('response ' + events);
    })
    // present data
  })
  .catch(function(err) {
    console.log('Failed to fetch data: ' + err);
    // Present error
  })
})

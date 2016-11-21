// Class to interact with the local datastore using LokiJS
var datastore = function(callback) {
  const loki = require('lokijs')

  var db = new loki('./resources/db.json', {autoload: true, autoloadCallback: callback })

  // Get a collection with a specific name from the datastore. Requested collection will be generated
  // for us if not available yet
  var collection = function(collectionName, options) {
    var promise = new Promise(function(resolve, reject) {
      var collection = db.getCollection(collectionName)

      if (collection === null) {
        collection = db.addCollection(collectionName, options)
        resolve(collection)
      } else { resolve(collection) }
    })
    return promise
  }
  // get the event collection from the datastore
  var eventCollection = function() {
    var promise = new Promise(function(resolve, reject) {
      collection('events', {unique: 'id'}).then(resolve)
    })
    return promise
  }
  // get the channel collection from the datastore
  var channelCollection = function() {
    var promise = new Promise(function(resolve, reject) {
      collection('channels', {unique: 'slug'}).then(resolve)
    })
    return promise
  }
  // get a event based on a given id
  var getEvent = function(id) {
    var promise = new Promise(function(resolve, reject) {
      eventCollection()
      .then(function(collection) {
        var event = collection.findOne({id: id})
        resolve(event)
      })
      .catch(reject)
    })
    return promise;
  }
  // private function to save each event
  // saving a bunch of events is not working because the catch block will be triggered
  // fot the very first duplicate record and loki will not insert the rest of the records
  var saveEvent = function(event) {
    var promise = new Promise(function(resolve, reject) {
      eventCollection()
      .then(function(collection) {
        // catch() is triggered if we try to insert a record that is already stored
        try {
            collection.insert(event)
        } catch (e) {
          console.log('error thrown on inserting event: ' + e);
        }
      })
      .then(resolve)
      .catch(reject)
    })
    return promise
  }

  // save the changes made to the datastore
  this.save = function() {
    var promise = new Promise(function(resolve, reject) {
      db.saveDatabase(resolve)
    })
    return promise

  }

  // get a list of upcoming events
  this.getLivestreams = function() {
    var promise = new Promise(function(resolve, reject) {
      Promise.all([eventCollection(), channelCollection()])
      .then(function(result) {
        var events = result[0].data
        var channelCollection = result[1]

        for (event of events) {
          event.podcast = channelCollection.findOne({slug: event.podcast})
          // Delete loki specific k/v pairs from result
          delete event.podcast['$loki']
          delete event.podcast.meta
          delete event['$loki']
          delete event.meta
        }
        resolve(events)
      })
      .catch(reject)
    })
    return promise
  }

  // save events in the events collection
  this.saveEvents = function(events) {
    var promise = new Promise(function(resolve, reject) {
      var promises = []
      for(event of events) {
        var _promise = saveEvent(event)
        promises.push(_promise)
      }
      Promise.all(promises)
      .then(resolve)
      .catch(reject)
    })
    return promise
  }

  // Search for a channel with a specific title
  // Will return null if channel isn't in the datastore
  this.getChannel = function(title) {
    var promise = new Promise(function(resolve, reject) {
      channelCollection()
      .then(function(collection) {
        var channel = collection.findOne({slug: title})
        resolve(channel)
      })
      .catch(reject)
    })
    return promise
  }
  // save a channel in the channel collection
  this.saveChannel = function(channel) {
    var promise = new Promise(function(resolve, reject) {
      channelCollection()
      .then(function (collection) {
        // catch() is triggered if we try to insert a record that is already stored
        try {
          collection.insert(channel)
        } catch (e) {
          console.log('error thrown on inserting channel: ' + e);
        }
      })
      .then(resolve)
      .catch(reject)
    })
    return promise
  }
}

module.exports = datastore

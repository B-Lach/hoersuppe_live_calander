var api = function() {
  const http = require('http')

  // Executing a GET request
  var GET = function(request) {
    var promise = new Promise(function(resolve, reject) {
      http.get(request, function(response) {
        var body = ''
        response.on('data', function(data) {
          body += data
        })
        response.on('end', function() {
          var parsedBody = JSON.parse(body)
          if (response.statusCode === 200 && parsedBody.msg === 'ok') {
            resolve(parsedBody.data)
          } else {
            reject(parsedBody)
          }
        })
      })
    })
    return promise
  }
  // Fetching data from the live calander
  this.fetchLiveData = function() {
    var promise = new Promise(function(resolve, reject) {
      GET({
          host: 'hoersuppe.de',
          // Using a static time range is ok for a concept, i guess
          // On production start und end date should be generated dynamically
          path: '/api/?action=getL_ive&dateStart=2016-11-20&dateEnd=2016-11-30',
          port: 80,
          method: 'GET'
      })
      .then(resolve)
      .catch(reject)
    })
    return promise
  }
  // Fetch the data for a specific podcast
  this.fetchChannel = function(title) {
    var promise = new Promise(function(resolve, reject) {
      GET({
        host: 'hoersuppe.de',
        path: '/api/?action=getPodcastData&podcast=' + title,
        port: 80,
        method: 'GET'
      })
      .then(resolve)
      .catch(reject)
    })
    return promise
  }
}
module.exports = api

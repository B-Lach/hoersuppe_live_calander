var API = require('./logic/api.js')
var api = new API()

api.fetchLiveData()
.then(function(data) {
  console.log(data)
})
.catch(function(error) {
  console.log('Failed with error: ' + JSON.stringify(error))
})

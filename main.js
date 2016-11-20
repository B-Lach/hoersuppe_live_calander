var api = new API()

api.fetchChannel('freak-show')
.then( function(data) {
  console.log(data)
})
.catch(function(error) {
  console.log('Failed with error: ' + JSON.stringify(error))
})

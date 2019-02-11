### Async run with ES6 yield function like a charm

    npm install async-run

Example:

    //The Async function

    function doAsync(value) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (value > 5) return reject('Too big value')
          resolve(`result${value}`)
        }, 200)
      })
    }

Let's call it multiple time

    var run = require('async-run').run

    run(function*() {
      var result1 = yield doAsync(1)
      // do stuff with result 1 here

      var result2 = yield doAsync(2)
      // do stuff with result 2 here

      var result3 = yield doAsync(3)
      // do stuff with result 3 here

      var result4 = yield doAsync(4)
      // do stuff with result 4 here

      return [result1, result2, result3, result4]
    }).then(result => {
      console.log(result)
      // [result1, result2, result3, result4]
    })

Sometime, when you want catch an error

    run(function*() {
      var bigResult = yield doAsync(10)
    }).catch(err => {
      console.log(err)
      // Too big value
    })

Or just use try catch

    run(function*() {
      try {
        var result = yield doAsync(1)
        // do stuff for result

        var failed = yield doAsync(10)
        // Exception was raised here

      } catch (err) {
        console.log(err)
        // Too big value
      }
    })

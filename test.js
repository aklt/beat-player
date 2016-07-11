
var count = 1000

function timeOuter() {
  if (count > 0) {
    count -= 1
    setTimeout(timeOuter, 10)
    console.warn('time')
  }
}


ready(function () {
  console.warn('Test')
})


var count = 1000

function timeOuter() {
  if (count > 0) {
    count -= 1
    setTimeout(timeOuter, 10)
    console.warn('time')
  }
}

bp.test.beatModel = function () {
  var bm1 = new BeatModel()
  bm1.loadBeatUrl('data/beat0.beat', function (err, model) {
    if (err) throw err
    console.warn('Loaded', model)
    console.warn('instruments', model.instruments())
  })
}
bp.test.player = function () {
  var bm1 = new BeatModel()
  bm1.loadBeatUrl('data/beat1.beat', function (err, model) {
    if (err) throw err
    var pl1 = PlayerView.create({
      model: model
    })
    pl1.renderModel()
    pl1.attach('#test1')
  })
}

ready(function () {
  console.warn('Test')
})

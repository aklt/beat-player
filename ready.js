/*global ready bp TextInput SliderInput InputHandler stepIter m*/

var defaultOptions = {
  beatsView1: {
    id: 'beatView1',
    options: ['beat0', 'beat1', 'beat2']
  },
  settingsView1: {
    bpm: 100,
    tpb: 4,
    beats: 12
  }
}

ready(function () {
  bp.started = Date.now()
  var live = bp.live

  Object.keys(live).forEach(function (name) {
    console.warn('live', name)
    var l1 = live[name]
    l1.renderModel(defaultOptions[name])
    l1.attach()
  })

  var ih1 = new InputHandler({
    model: bp.model,
    keyboardView: live.keyboardView1,
    player: live.playerView1
  })
  ih1.eventsAttach()
  live.ih1 = ih1

  // TextInput pops up to get input
  var textInput1 = TextInput.create({id: 'textInput1'})
  live.textInput1 = textInput1

  var sliderInput1 = SliderInput.create({id: 'sliderInput1'})
  live.sliderInput1 = sliderInput1

  live.stepFocus = stepIter([live.keyboardView1, live.playerView1, live.instrumentsView1, live.beatsView1, live.controlsView])

  // subscriptions
  m.subscribe('SelectInstrument', function () {
    live.instrumentsView1.selectInstrumentNumber()
  })

  m.subscribe('SelectInstrumentRange', function () {
    live.instrumentsView1.selectInstrumentRange()
  })

  m.subscribe('NewText', function () {
    live.playerView1.reAttach()
  })

  m.loadBeat('data/beat1.beat', function (err, model) {
    if (err) throw err
    console.warn('Loaded beat1')
    live.playerView1.detach()
    live.playerView1.renderModel()
    live.playerView1.attach()
    live.playerView1.gotoPos(1)
  })
})


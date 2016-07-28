/*global ready bp TextInput SliderInput InputHandler stepIter BeatAudio */

// TODO use model for defaults
var defaultOptions = {
  beatsView: {
    id: 'beatView',
    options: ['beat0', 'beat1', 'beat2', 'beat3']
  },
  settingsView1: {
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
    if (typeof l1.renderModel === 'function') {
      l1.renderModel(defaultOptions[name])
    }
    l1.attach()
  })

  live.inputHandler1 = new InputHandler({
    model: bp.model,
    keyboardView: live.keyboard,
    player: live.player1
  })
  live.inputHandler1.eventsAttach()

  live.textInput1 = TextInput.create({id: 'textInput1'})
  live.sliderInput1 = SliderInput.create({id: 'sliderInput1'})

  live.beatAudio1 = new BeatAudio(bp.model)

  // TODO handle focus with mouse
  live.stepFocus = new IterElems([
    live.beatsView,
    live.settings,
    live.controlsView1,
    live.player1,
    live.keyboard,
    live.instruments
  ])
  live.stepFocus.get().focus()


  m.loadBeatUrl('data/beat0.beat', function (err, model) {
    if (err) throw err
    console.warn('Loaded beat1')
    live.player1.detach()
    live.player1.renderModel()
    live.player1.attach()
    live.player1.gotoPos(0)
  })
})


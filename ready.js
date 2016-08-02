/*global ready bp TextInput SliderInput InputHandler stepIter BeatAudio */

// TODO use model for defaults
var defaultOptions = {
  beatsView: {
    id: 'beatView',
    options: ['beat0', 'beat1', 'beat2', 'beat3', 'dundunba']
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
  // TODO Put this in inputhandler
  live.stepFocus = new IterElems([
    live.beatsView,
    live.settings,
    live.controlsView1,
    live.player1,
    live.keyboard,
    live.instruments
  ])
  live.stepFocus.get().focus()

  // Load initial beat
  m.dispatch('LoadBeat', 'data/beat0.beat')

})


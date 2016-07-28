/*global ready bp TextInput SliderInput InputHandler stepIter BeatAudio */

// TODO use model for defaults
var defaultOptions = {
  beatsView1: {
    id: 'beatView1',
    options: ['beat0', 'beat1', 'beat2', 'beat3']
  },
  settingsView1: {
    tpb: 4,
    beats: 12
  }
}

 // TODO move subscriptions elsewhere
 var m = bp.model
 var live = bp.live
 m.subscribe('SelectInstrument', function () {
   live.instrumentsView1.selectInstrumentNumber()
 })

 m.subscribe('SelectInstrumentRange', function () {
   live.instrumentsView1.selectInstrumentRange()
 })

 m.subscribe('NewText', function () {
   live.playerView1.update()
   live.settingsView1.update()
 })

 m.subscribe('play', function () {
   live.controlsView1.play()
   live.beatAudio1.play()
   m.playing(true)
 })

 m.subscribe('stop', function () {
   live.controlsView1.stop()
   live.beatAudio1.stop()
   m.playing(false)
 })

 m.subscribe('GotoPos', function (pos) {
   live.playerView1.gotoPos(pos)
   m.position(pos)
 })

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
    keyboardView: live.keyboardView1,
    player: live.playerView1
  })
  live.inputHandler1.eventsAttach()

  live.textInput1 = TextInput.create({id: 'textInput1'})
  live.sliderInput1 = SliderInput.create({id: 'sliderInput1'})

  live.beatAudio1 = new BeatAudio(bp.model)

  // TODO handle focus with mouse
  live.stepFocus = new StepIterElems([
    live.beatsView1,
    live.settingsView1,
    live.controlsView1,
    live.playerView1,
    live.keyboardView1,
    live.instrumentsView1
  ])
  live.stepFocus.get().focus()


  m.loadBeatUrl('data/beat0.beat', function (err, model) {
    if (err) throw err
    console.warn('Loaded beat1')
    live.playerView1.detach()
    live.playerView1.renderModel()
    live.playerView1.attach()
    live.playerView1.gotoPos(0)
  })
})


/*global ready bp BeatModel KeyboardView InstrumentsView PlayerView InputHandler
  TextInput SliderInput InstrumentsView BeatsView each*/

var live = bp.live

ready(function () {
  bp.started = Date.now()

  Object.keys(live).forEach(function (name) {
    var l1 = live[name]
    l1.renderModel()
    l1.attach()
  })

  // // KeyboardView
  // live.keyboardView1.render()
  // live.keyboardView1.attach('#keyboard')

  // // InstrumentsView
  // live.instrumentsView1.render({
    // name: 'goo',
    // url: '/data/bd.wav'
  // })
  // live.instrumentsView1.attach('#instruments')

  // // BeatsView
  // live.beatsView1.render({id: 'beatView1',
              // text: 'Hello BeatsView',
              // options: ['beat0', 'beat1', 'beat2']})

  // live.beatsView1.attach('#beatsView')

  // // PlayerView
  // // live.playerView1.renderModel()
  // // live.playerView1.attach('#player1')

  // // ControlsView
  // live.controlsView1.render()
  // live.controlsView1.attach('#controls')

  // InputHandler handles events on body
  var ih1 = new InputHandler({
    model: bp.model,
    keyboardView: live.keyboardView1,
    player: live.playerView1
  })
  ih1.eventsAttach()
  bp.live.ih1 = ih1

  // TextInput pops up to get input
  var textInput1 = TextInput.create({id: 'textInput1'})
  bp.live.textInput1 = textInput1

  var sliderInput1 = SliderInput.create({id: 'sliderInput1'})
  bp.live.sliderInput1 = sliderInput1

  // bp.testBeatAudio()
  // bp.test.bp.model()
  //
  live.stepFocus = stepIter([live.keyboardView1, live.playerView1, live.instrumentsView1, live.beatsView1, live.controlsView])


  bp.model.loadBeat('data/beat1.beat', function (err, model) {
    if (err) throw err
    console.warn('Loaded beat1')
    live.playerView1.detach()
    live.playerView1.renderModel()
    live.playerView1.attach()
    live.playerView1.gotoPos(1)
  })
})


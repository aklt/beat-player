/*global ready bp BeatModel KeyboardView InstrumentsView PlayerView InputHandler
  TextInput SliderInput InstrumentsView BeatsView each*/

function lcFirst (text) {
  return text[0].toLowerCase() + text.slice(1)
}

// Render
var beatModel = new BeatModel()
var live = bp.live = {}
each([KeyboardView, InstrumentsView, BeatsView, PlayerView], function (i, Class) {
  bp.live[lcFirst(Class.name)] = Class.create({
    model: beatModel
  })
})

// subscribe
beatModel.subscribe('SelectInstrument', function () {
  live.instrumentsView.selectInstrumentNumber()
})

beatModel.subscribe('SelectInstrumentRange', function () {
  live.instrumentsView.selectInstrumentRange()
})

beatModel.subscribe('NewText', function () {
  live.playerView.reAttach()
})

ready(function () {
  bp.started = Date.now()

  // KeyboardView
  live.keyboardView.render()
  live.keyboardView.attach('#keyboard')

  // InstrumentsView
  live.instrumentsView.render({
    name: 'goo',
    url: '/data/bd.wav'
  })
  live.instrumentsView.attach('#instruments')

  // BeatsView
  live.beatsView.render({id: 'beatView1',
              text: 'Hello BeatsView',
              options: ['beat0', 'beat1', 'beat2']})
  live.beatsView.attach('#player1')

  // PlayerView
  live.playerView.renderModel()
  live.playerView.attach('#player1')

  // InputHandler handles events on body
  var ih1 = new InputHandler({
    model: beatModel,
    keyboardView: live.keyboardView,
    player: live.playerView
  })
  ih1.eventsAttach()
  bp.live.ih1 = ih1

  // TextInput pops up to get input
  var ti1 = TextInput.create({id: 'textInput1'})
  bp.live.ti1 = ti1

  var si1 = SliderInput.create({id: 'sliderInput1'})
  bp.live.si1 = si1

  // bp.testBeatAudio()
  // bp.test.beatModel()

  beatModel.load('data/beat2.beat', function (err, model) {
    if (err) throw err
    console.warn('Loaded beat1')
    live.playerView.detach()
    live.playerView.renderModel()
    live.playerView.attach()
  })
})


/*global ready bp BeatModel KeyboardView InstrumentsView PlayerView InputHandler
  TextInput SliderInput InstrumentsView BeatsView*/

ready(function () {
  bp.started = Date.now()
  bp.live = {}

  // Main

  var beatModel = new BeatModel()

  // KeyboardView
  var kv1 = KeyboardView.create({
    model: beatModel
  })
  kv1.render()
  kv1.attach('#keyboard')
  bp.live.kv1 = kv1

  // InstrumentsView
  var iv1 = InstrumentsView.create({
    model: beatModel
  })
  iv1.render({
    name: 'goo',
    url: '/data/bd.wav'
  })
  iv1.attach('#instruments')
  bp.live.iv1 = iv1

  // BeatsView
  var bv1 = BeatsView.create({ model: beatModel })
  bv1.render({id: 'beatView1',
              text: 'Hello BeatsView',
              options: ['beat0', 'beat1', 'beat2']})

  bv1.attach('#player1')
  // PlayerView
  var pl1 = PlayerView.create({
    model: beatModel
  })
  pl1.renderModel()
  pl1.attach('#player1')

  // InputHandler handles events on body
  var ih1 = new InputHandler({
    model: beatModel,
    keyboardView: kv1,
    player: pl1
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
    pl1.detach()
    pl1.renderModel()
    pl1.attach()
  })

  return true

  // SliderInput for slidable values
  // var si1 = SliderInput.create({el: '#slider1'})
  // // si1.eventsAttach()
  // si1.setRange(0, 100)
  // si1.render()
  // bp.sliderInput1 = si1

  // test audio
  // bp.beat1.test()

  // var instrumentsView = InstrumentsView.create()
  // instrumentsView.render({name: 'name', url: 'foo/url.pattern'})
  // instrumentsView.attach('#ie1')
  // bp.iv1 = instrumentsView

  // ab.delay(1001, () => {
    // console.warn('syop')
    // player1.stop()
  // })
  // ab.delay(2001, () => {
    // console.warn('set')
    // // player1.gotoPos(4)
  // })
  // // ab.delay(2501, () => {
    // // console.warn('Hello')
    // // // player1.start()
  // // })

  // var player = new Player({id: 'player0'})
  // // player.eventsAttach()
})


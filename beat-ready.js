ab.ready(function () {
  var start = Date.now()
  console.warn('ready', start)

  // KeyboardView
  var kv1 = KeyboardView.create()
  kv1.render()
  kv1.attach('#keyboard')

  ab.kv1 = kv1

  var si1 = SliderInput.create({el: '#slider1'})
  // si1.eventsAttach()
  si1.setRange(0, 100)
  ab.sliderInput1 = si1

  var smallInput1 = SmallInput.create({top: '12rem', left: '12rem'})
  smallInput1.render({value: 101})
  ab.smallInput1 = smallInput1

  var instrumentsView = InstrumentsView.create()
  instrumentsView.render({name: 'name', url: 'foo/url.pattern'})
  instrumentsView.attach('#ie1')
  ab.iv1 = instrumentsView

var player1 = ab.player1 = Player.create({
  bpm: 100,
  tpb: 6,
  bar: 4,
  tracks: [
    'ab..',
    'cd..',
    'cd..',
    '00..',
    'cd..',
    'cd..',
  ].map((s1) => {
    return s1.split('')
  }),
  css: {
    border: '1px solid red'
  }})

  // InputHandler handles events on body
  var ih1 = new InputHandler({
    keyboardView: kv1,
    player: player1
  })
  // ih1.eventsAttach()
  ab.ih1 = ih1

console.warn('Created player', player1)

  bp.el = ab.qs('#player0')
  player1.render({
    settings: {
      bpm: 100,
      tpb: 4,
      bar: 4,
    },
    columns: [
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
      '....',
    ].map((ss) => {
      return ss.split('')
    }),
    score: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'
    ],
    instruments: [
      {name: 'aa'},
      {name: 'bb'},
      {name: 'cc'}
    ]
  })
  console.warn('Rendered Player: ', player1)
  player1.attach('#player1')
  player1.start()
  ab.delay(1001, () => {
    console.warn('syop')
    player1.stop()
  })
  ab.delay(2001, () => {
    console.warn('set')
    // player1.gotoPos(4)
  })
  // ab.delay(2501, () => {
    // console.warn('Hello')
    // // player1.start()
  // })

  var player = new Player({id: 'player0'})
  // player.eventsAttach()
})


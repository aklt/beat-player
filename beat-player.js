/*global ab, Audio, requestAnimationFrame*/
(function (win) {
  var bp = win.beatPlayer = {}

  ab.classes = {}

  var keyboardKeys = [
    '1234567890',
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM,.']

  ab.mix.focus = function (AClass) {
    AClass.prototype.focus = function () {
      ab.css(this.el, {
        border: '1px solid blue'
      })
    }
    AClass.prototype.unfocus = function () {
      ab.css(this.el, {
        border: 'none'
      })
    }
  }

  // {{{1 KeyboardView
  function KeyboardView (o) {
    o = o || {}
    this.ranges = o.ranges || {
      // Assumption: The array is sorted as the keyboard
      // and intervals do not overlap
      1: ['U', 'F'],
      2: ['Q', 'R']
    }
    this.selectedSample = '3'
  }

  KeyboardView.prototype = {
    template: function (o) {
      var rangeStart = this.rangesToIndex()
      var rangeEnd = {}
      o = o || {}
      o.classes = o.classes || this.classes
      return ab.templates.keyboard(keyboardKeys.map((row, j) => {
        var keys = ''
        var chars = row.split('')
        if (j === 0) return ab.templates.keyboardRow(chars)
        for (var i = 0; i < chars.length; i += 1) {
          var ch = chars[i]
          if (rangeStart[ch]) {
            rangeEnd = ab.extend(rangeEnd, rangeStart[ch])
            keys += '<span class="' + o.classes + '">'
            delete rangeStart[ch]
          }
          keys += '<i>' + ch + '</i>'
          if (rangeEnd[ch]) {
            keys += '</span>'
            delete rangeEnd[ch]
          }
        }
        return (j > 1 ? ' ' : '') + keys
      }))
    },
    rangesToIndex: function () {
      var result = {}
      var self = this
      Object.keys(this.ranges).forEach(function (sample) {
        var range = self.ranges[sample]
        result[range[0]] = {}
        result[range[0]][range[1]] = sample
      })
      return result
    },
    afterRender: function (el) {
      var samples = ab.qa('b', el || this.el)
      if (this.lastSampleEl) ab.classRemove(this.lastSampleEl, 'active-sample')
      // Select the active sample
      for (var i = 0; i < samples.length; i += 1) {
        var s1 = samples[i]
        if (s1.innerText === this.selectedSample) {
          ab.classAdd(s1, 'active-sample')
          this.lastSampleEl = s1
          break
        }
      }
    },
    selectSample: function (sample) {
      this.selectedSample = sample + ''
      this.afterRender()
    }
  }

  ab.mix.dom(KeyboardView)
  ab.mix.focus(KeyboardView)

  ab.mix.handlers(KeyboardView, {
    click: function (event, el) {
      // Sample
      if (el.nodeName === 'B') {
        if (this.lastSampleEl) {
          ab.classRemove(this.lastSampleEl, 'active-sample')
        }
        ab.classAdd(el, 'active-sample')
        this.lastSampleEl = el
        this.selectedSample = el.innerText
      // Keyboard
      } else if (el.nodeName === 'I') {
        if (this.lastKey) {
          ab.classRemove(this.lastKey, 'active-key')
        }
        ab.classAdd(el, 'active-key')
        this.lastKey = el
      }
    },
  })
  ab.classes.KeyboardView = KeyboardView


  KeyboardView.prototype.keyLeft = function (ev, el) {
    console.warn(ev, el)
  }
  KeyboardView.prototype.keyRight = function (ev, el) {
    console.warn(ev, el)
  }
  KeyboardView.prototype.keyUp = function (ev, el) {
    console.warn(ev, el)
  }
  KeyboardView.prototype.keyDown = function (ev, el) {
    console.warn(ev, el)
  }

  // 1}}} KeyboardView

  // {{{1 InputHandler
  var key0 = '0'.charCodeAt(0)
  var key9 = '9'.charCodeAt(0)
  var keyUp = 38
  var keyDown = 40
  var keyLeft = 37
  var keyRight = 39
  var keyEnter = 13
  var keySpace = 32
  var keyEsc = 27
  var keyTab = 9
  var keyKeys = {}

  keyboardKeys.join('').split('').forEach(function (k) {
    keyKeys[k] = 1
  })

  function InputHandler (o) {
    console.warn('InputHandler', o)
    if (!o.keyboardView) throw new Error('Need o.keyboardView')
    if (!o.player) throw new Error('o.player')
    this.keyboardView = o.keyboardView
    this.player = o.player
    this.el = document
  }

  ab.classes.InputHandler = InputHandler

  InputHandler.prototype = {
  }

  ab.mix.handlers(InputHandler, {
    keydown: function (ev, el) {
      var code = ev.which
      console.warn('Key', code, ev.charCode, String.fromCharCode(code))
      if (code <= key9 && code >= key0) {
        this.keyboardView.selectSample(String.fromCharCode(code))
      } else if (code === keyUp) {
        console.warn('keyUp')
        if (ab.lastPopUp && ab.lastPopUp.keyUp) ab.lastPopUp.keyUp()
        ev.preventDefault()
      } else if (code === keyDown) {
        console.warn('keyDown')
        if (ab.lastPopUp && ab.lastPopUp.keyDown) ab.lastPopUp.keyDown()
        ev.preventDefault()
      } else if (code === keyLeft) {
        console.warn('keyLeft')
        if (ab.lastPopUp && ab.lastPopUp.keyLeft) ab.lastPopUp.keyLeft()
        ev.preventDefault()
      } else if (code === keyRight) {
        console.warn('keyRight')
        if (ab.lastPopUp && ab.lastPopUp.keyRight) ab.lastPopUp.keyRight()
        ev.preventDefault()
      } else if (code === keySpace) {
        console.warn('keySpace')
        ev.preventDefault()
      } else if (code === keyEsc) {
        console.warn('keyEsc')
        if (ab.lastPopUp) ab.lastPopUp.inputEl.hide()
        ev.preventDefault()
      } else if (code === keyEnter) {
        console.warn('keyEnter')
        ev.preventDefault()
      } else if (code === keyTab) {
        console.warn('keyTab')
        if (!this.activeTab) this.activeTab = this.keyboardView
        this.activeTab.unfocus()
        if (this.activeTab === this.keyboardView) this.activeTab = this.player
        else this.activeTab = this.keyboardView
        this.activeTab.focus()

        return ev.preventDefault()
      } else {
        var k = String.fromCharCode(code)
        if (keyKeys[k]) {
          console.warn('play key', k)
        }
      }
    },
    keyup: function () {
      console.warn('up', arguments)
    },
    wheel: function () {
      console.warn('scroll', arguments)
    }

  })

  // 1}}} InputHandler

  // {{{1 Player
  bp.sounds = {
    bd: new Audio('samples/bd.wav'),
    // bd: new Audio('http://download.wavetlan.com/SVV/Media/HTTP/WAV/Media-Convert/Media-Convert_test6_PCM_Stereo_VBR_16SS_8000Hz.wav'),
    sd: new Audio('samples/sd.wav'),
    hat: new Audio('samples/hat.wav')
  }

  function ScoreColumns (el) {
    // console.warn(ab.type(el));
    this.els = ab.qa('* p', el).filter(function (el1) {
      return el1.childNodes.length > 1
    })
    this.selectedIndex = -1
    this.selectedEl = this.els[this.selectedIndex]
    this.lastSelectedEl = this.selectedEl
    console.warn('els', this.els)
  }

  ScoreColumns.prototype = {
    step: function (units) {
      if (!units) units = 1
      this.selectedIndex += units
      if (this.selectedIndex >= this.els.length) this.selectedIndex = 0
      this.lastSelectedEl = this.selectedEl
      this.selectedEl = this.els[this.selectedIndex]

      if (!this.selectedEl) throw new Error('BAd ' + this.selectedIndex)
      if (this.lastSelectedEl) ab.classRemove(this.lastSelectedEl, 'active')
      ab.classAdd(this.selectedEl, 'active')
    }
  }

  function Player (o) {
    o = o || {}
    this.el = o.el || ab.dom('<div class="player"></div>')
    if (typeof this.el === 'string') this.el = ab.qs(this.el)
    if (!this.el) throw new Error('Bad el ' + this.el)
    // this.scoreColumns = new ScoreColumns(this.el)

    this.bpm = o.bpm || 100
    this.lpb = o.lpb || 4
    this.bar = o.bar || 4
    this.bars = this.bar

    this.tracks = []

    for (var ibar = 0; ibar < this.bars; ibar += 1) {
      this.tracks[ibar] = []
      for (var ilpb = 0; ilpb < this.lpb; ilpb += 1) {
        this.tracks[ibar][ilpb] = (o.tracks && o.tracks[ibar] && o.tracks[ibar][ilpb])
        if (!this.tracks[ibar][ilpb]) this.tracks[ibar][ilpb] = '·'
      }
    }
    console.warn('Player', this)
  }

  Player.prototype = {
    template: function (o) {
      console.warn('Player template', o)
      var t = ab.templates
      o.settings = t.settings(o.settings)
      o.score = ab.templates.scoreSpan([1, 2, 3, 4, 5, 6, 7, 8, 9, 'A'])
      o.instruments = t.instruments(o.instruments)
      o.columns = t.columnEmpty() + this.tracks.map(t.column).join('\n') //(o.columns[0])
      var player = t.player(o)
      console.warn('Player Template:', player, o)
      return player

    },
    afterRender: function (el) {
      this.el = el

    },
    renderTrack: function (track) {
      // var columns = []
      var i = 0
      var length = this.lpb * this.bar * this.bars
      while (i < length) {
        i += 1
      }
    },
    setBpmBarLpb: function (bpm, bar, lpb) {
      if (bpm) this.bpm = bpm
      if (bar) this.bar = bar
      if (lpb) this.lpb = lpb
      this.restart()
    },
    gotoPos: function (pos) {
      this.scoreColumns.selectedIndex = -1
      this.scoreColumns.step(pos)
    },
    start: function (from) {
      var self = this
      this.interval = setInterval(function () {
        requestAnimationFrame(function () {
          self.step()
        })
      }, (this.bpm / 60) * this.bar * this.lpb * 100)
    },
    stop: function () {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    },
    step: function (amount) {
      amount = amount || 1
      this.currentPos += amount
      this.scoreColumns.step(amount)
    }
  }

  ab.mix.dom(Player)
  ab.mix.focus(Player)

  Player.prototype.unfocus = function () {
    console.warn('aa', this.el)
      ab.css(this.el.childNodes[0], {
        border: 'none'
      })
      if (ab.lastPopUp) ab.lastPopUp.hide()
  }
  Player.prototype.focus = function () {
      ab.css(this.el.childNodes[0], {
        border: '1px solid blue'
      })
      if (ab.lastPopUp) {
        ab.lastPopUp.show()
        ab.lastPopUp.inputEl.select()
      }
  }

  Player.prototype.keyLeft = function (ev, el) {
    console.warn(ev, el)
  }
  Player.prototype.keyRight = function (ev, el) {
    console.warn(ev, el)
  }
  Player.prototype.keyUp = function (ev, el) {
    console.warn(ev, el)
  }
  Player.prototype.keyDown = function (ev, el) {
    console.warn(ev, el)
  }

  const alphaNum = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  // function decToalphanum (num) {
    // if (num >= alphaNum.length) {
      // console.warn('reset num from ', num)
      // num = alphaNum.length - 1
      // console.warn('reset num to', num)
    // }
    // return alphaNum[num]
  // }

  function alphanumToDec (anum) {
    return alphaNum.indexOf(anum + '')
  }

  ab.mix.handlers(Player, {
    click: function (ev, el) {
      console.warn('You clicked', ev, el, el.parentNode)
      console.warn('This is index', el, el.parentNode)
      var rowIndex = [].slice.call(el.parentNode.childNodes).indexOf(el)
      var columnIndex
      console.warn('Player index', rowIndex, columnIndex)
      var r1
      switch (el.nodeName) {
        case 'P':
          console.warn('P Instrument', el)
          // var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
          textInputWidth = '4rem'
        case 'B':
          textInputWidth = '1rem'
          r1 = ab.rect(el)
          if (ab.lastPopUp) ab.lastPopUp.hide()
          ab.smallInput1.popup({
            top: r1.top,
            left: r1.left,
            value: el.innerText,
            width: textInputWidth
          })
          ab.lastPopUp = ab.smallInput1
          break
        case 'I': // Click top row to go to position
          console.warn('I', alphanumToDec(el.innerText))
          // this.gotoPos(alphanumToDec(el.innerText))
          break
        case 'ABBR':
          r1 = ab.rect(ab.qs('dd', el))
        case 'DT':
        case 'DD':
          r1 = ab.rect(el)
          if (ab.lastPopUp) ab.lastPopUp.hide()
          ab.sliderInput1.popup({
            top: r1.top,
            left: r1.left,
            value: el.innerText,
            set: function (value) {

            }
          })
          ab.lastPopUp = ab.sliderInput1
          break
      }
    }
  })


  // {{{2 
  // 2}}}

  // 1}}} Player

  // {{{1 Slider Input
  function SliderInput (o) {
    o = o || {}
    this.el = o.el || document.body
    if (typeof this.el === 'string') this.el = ab.qs(this.el)
    this.sliderEl = ab.qs('input[type=range]', this.el)
    this.textEl = ab.qs('input[type=text]', this.el)
    if (!this.el) throw new Error('Need o.el')
    if (!this.sliderEl) throw new Error('Need o.sliderEl')
    if (!this.textEl) throw new Error('Need o.textEl')
  }

  SliderInput.prototype = {
    template: function (o) {
      return ab.templates.sliderInput(o)
    },
    setRange: function (start, stop, value) {
      value = value || (start + stop) / 2
      ab.attr(this.sliderEl, {min: start,
                              max: stop,
                              value: value})
      ab.attr(this.textEl, {value: value})
    },
    setPosition: function (top, left) {
      ab.css(this.el, {
        position: 'absolute',
        top: top + 'px',
        left: left + 'px'
      })
    },
    afterRender: function (el) {
      this.inputEl = ab.qs('input[type=text]', el)
    },
    popup: function (o) {
      o.value = o.value || this.inputEl.value
      this.detach()
      if (o.value !== this.lastValue) this.render(o)
      this.attach(this.parent)
      ab.css(this.el, {
        position: 'absolute',
        top: o.top + 'px',
        left: o.left + 'px',
        'background-color': ab.color(ab.randInt(1, 100), 0x99, 0xEE)
      })
      ab.css(this.sliderEl, {
        'background-color': ab.color(ab.randInt(1, 100), 0x99, 0xEE)
      })
      ab.classRemove(this.el, 'hidden')
      this.lastValue = this.inputEl.value = o.value
      this.inputEl.focus()
      this.inputEl.select()
    }
  }

  ab.mix.dom(SliderInput)

  ab.mix.handlers(SliderInput, {
    input: function (ev, el) {
      this.textEl.value = Math.round(el.value)
    },
    change: function (ev, el) {
      this.textEl.value = Math.round(el.value)
    },
    keydown: function (ev, el) {
      console.warn('Key i sdown', ev, el)
    }
  })
  // 1}}} Slider Input

// {{{1 SmallInput
function SmallInput (o) {
  
}

SmallInput.prototype = {
  template: function (o) {
    var res = ab.templates.smallInput(o)
    console.warn('SmallInput template', res)
    return res
  },
  afterAttach: function (el) {
    this.inputEl = ab.qs('input[type=text]', this.el)
    ab.classRemove(this.el, 'hidden')
  },
  popup: function (o) {
    o.value = o.value || this.inputEl.value
    this.detach()
    if (o.value !== this.lastValue) this.render(o)
    this.attach(this.parent)
    ab.css(this.el, {
      position: 'absolute',
      top: o.top + 'px',
      left: o.left + 'px',
      'background-color': ab.color(ab.randInt(1, 100), 0x99, 0xEE),
      width: o.width || '1rem'
    })
    ab.classRemove(this.el, 'hidden')
    this.lastValue = this.inputEl.value = o.value
    this.inputEl.focus()
    this.inputEl.select()
  }
}

ab.mix.dom(SmallInput)


// 1}}} SmallInput

  // {{{1 Slider

  function Slider () {

  }

  ab.mix.dom(Slider)

  Slider.prototype = {

  }

  ab.mix.handlers(Slider, {
    scroll: function () {
      console.warn('scroll')
    }
  })

  // 1}}} Slider

  // {{{1 
  function Samples () {
  }

  ab.mix.dom(Samples)

  Samples.prototype = {
    draw: function (el) {
      ab.templates.keyboard({
      })
    }
  }

  // 1}}} Samples

  ab.ready(function () {
    console.warn('ready', bp.sounds.bd)
    console.warn('ready', bp.sounds.bd.play())
    // var start = Date.now()

    // KeyboardView
    var kv1 = KeyboardView.create()
    kv1.render()
    kv1.attach('#keyboard')

    ab.kv1 = kv1

    var si1 = SliderInput.create({el: '#slider1'})
    si1.eventsAttach()
    si1.setRange(0, 100)
    si1.setPosition(100, 100)
    si1.attach('body')
    ab.sliderInput1 = si1

    var smallInput1 = SmallInput.create({top: '12rem', left: '12rem'})
    smallInput1.render({value: 101})
    smallInput1.attach('body');
    ab.smallInput1 = smallInput1


  var player1 = ab.player1 = Player.create({
    bpm: 100,
    lpb: 6,
    bar: 4,
    tracks: [
      ['a','b'],
      ['c','d']
    ],
    css: {
      border: '1px solid red'
    }})

    // InputHandler handles events on body
    var ih1 = new InputHandler({
      keyboardView: kv1,
      player: player1
    })
    ih1.eventsAttach()
    ab.ih1 = ih1

  console.warn('Created player', player1)

    bp.el = ab.qs('#player0')
    player1.render({
      settings: {
        bpm: 100,
        lpb: 4,
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
        1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C'
      ],
      instruments: [
        {name: 'aa'},
        {name: 'bb'}
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
    ab.delay(2501, () => {
      console.warn('Hello')
      player1.start()
    })

    var player = new Player({id: 'player0'})
    player.eventsAttach()
  })
}(window))

/*global ab, Audio, requestAnimationFrame*/
(function (win) {
  var bp = win.beatPlayer = {}

  ab.classes = {}

  var keyboardKeys = [
    '1234567890',
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM,.']

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
    template: function (o) {
      var rangeStart = this.rangesToIndex()
      var rangeEnd = {}
      return ab.templates.keyboard(keyboardKeys.map((row, j) => {
        var keys = ''
        var chars = row.split('')
        if (j === 0) return ab.templates.keyboardRow(chars)
        for (var i = 0; i < chars.length; i += 1) {
          var ch = chars[i]
          if (rangeStart[ch]) {
            rangeEnd = ab.extend(rangeEnd, rangeStart[ch])
            keys += '<span style=\'background-color: ' + ab.color(j + i) + '\'>'
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
    afterRender: function (el) {
      var samples = ab.qa('b', el || this.el)
      if (this.lastSampleEl) ab.classRemove(this.lastSampleEl, 'active-sample')
      // Select the active sample
      for (var i = 0; i < samples.length; i += 1) {
        var s1 = samples[i]
        if (s1.innerText === this.selectedSample) {
          ab.classAdd(s1, 'active-sample')
          this.lastSampleEl = s1
        }
      }
    },
    selectSample: function (sample) {
      this.selectedSample = sample + ''
      this.afterRender()
    }
  }

  ab.mix.dom(KeyboardView)

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
    }
  })
  ab.classes.KeyboardView = KeyboardView

  // 1}}} KeyboardView

  // {{{1 KeyboardHandler
  var key0 = '0'.charCodeAt(0)
  var key9 = '9'.charCodeAt(0)
  var keyUp = 38
  var keyDown = 40
  var keyLeft = 37
  var keyRight = 39
  var keyKeys = {}

  keyboardKeys.join('').split('').forEach(function (k) {
    keyKeys[k] = 1
  })

  function KeyboardHandler (o) {
    console.warn('KeyboardHandler', o)
    if (!o.keyboardView) throw new Error('Need o.keyboardView')
    this.keyboardView = o.keyboardView
  }

  ab.classes.KeyboardHandler = KeyboardHandler

  KeyboardHandler.prototype = {
  }

  ab.mix.handlers(KeyboardHandler, {
    keydown: function (ev, el) {
      var code = ev.which
      console.warn('Key', code, ev.charCode, String.fromCharCode(code))
      if (code <= key9 && code >= key0) {
        this.keyboardView.selectSample(String.fromCharCode(code))
      } else if (code === keyUp) {
        console.warn('keyUp')
      } else if (code === keyDown) {
        console.warn('keyDown')
      } else if (code === keyLeft) {
        console.warn('keyLeft')
      } else if (code === keyRight) {
        console.warn('keyRight')
      } else {
        var k = String.fromCharCode(code)
        if (keyKeys[k]) {
          console.warn('play key', k)
        }
      }
    },
    keyup: function () {
      console.warn('up', arguments)
    }
  })

  // 1}}} KeyboardHandler

  // {{{1 Player
  bp.sounds = {
    bd: new Audio('samples/bd.wav'),
    // bd: new Audio('http://download.wavetlan.com/SVV/Media/HTTP/WAV/Media-Convert/Media-Convert_test6_PCM_Stereo_VBR_16SS_8000Hz.wav'),
    sd: new Audio('samples/sd.wav'),
    hat: new Audio('samples/hat.wav')
  }

  function ScoreColumns (el) {
    // console.warn(ab.type(el));
    this.els = ab.qa('p', el).filter(function (el1) {
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
    this.el = ab.qs('#' + o.id)
    if (!this.el) throw new Error('Bad el' + o.id)
    this.templates = ab.readTemplates(ab.qs('#player'))
    Object.keys(this.templates).forEach((template) => {
      this.templates[template] = this.templates[template]
    })
    this.scoreColumns = new ScoreColumns()
    this.tracks = o.tracks || []

    this.bpm = o.bpm || 100
    this.lpb = o.lpb || 2
    this.bar = o.bar || 2
    this.bars = 2
  }

  Player.prototype = {
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

  var player1 = ab.player1 = Player.create({
    id: 'player1',
    css: {
      border: '1px solid red'
    },
    template: function (o) {
      console.warn(player1.templates)
      var outer = ab.templates.outer(o)
      // console.warn(outer('Hello'))
      return outer
    }})

  console.warn('Created player', player1)

  ab.mix.handlers(Player, {
    click: function (ev, el) {
      console.warn('You clicked', ev, el, el.parentNode)
      switch (el.nodeName) {
        case 'B':
          ab.dom1 = ab.dom('<input name="input1" type="text" class="small-input" value="' + el.innerText + '"></input>', {
            css: {
              border: '1px solid green',
              'background-color': '#7899AA',
              width: '1.1rem',
              height: '1.1rem',
              'margin-left': '-0.4rem'
            }
          })
          ab.dom1parent = el
          ab.append(el, ab.dom1)
          ab.dom1.focus()
          ab.dom1.select()
          break
        case 'I': // Click top row to go to position
          console.warn('I', alphanumToDec(el.innerText))
          this.gotoPos(alphanumToDec(el.innerText))
          break
        case 'P':
          console.warn('P Instrument', el)
          // var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
          break
      }
    }
  })

  // 1}}} Player

  // {{{1 Slider Input
  function SliderInput (o) {
    o = o || {}
  }

  SliderInput.prototype = {
    setRange: function (start, stop, value) {
      value = value || (start + stop) / 2
      if (!this.sliderEl) this.sliderEl = ab.qs('input[type=range]', this.el)
      if (!this.textEl) this.textEl = ab.qs('input[type=text]', this.el)
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
    }
  }

  ab.mix.dom(SliderInput)

  ab.mix.handlers(SliderInput, {
    input: function (ev, el) {
      console.warn('input', el.value)
    },
    change: function (ev, el) {
      console.warn('change', el.value)
    }
  })
  // 1}}} Slider Input

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

  // {{{1 Samples
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

    // KeyboardHandler handles events on body
    var kb1 = new KeyboardHandler({
      keyboardView: kv1
    })
    kb1.eventsAttach()

    ab.kv1 = kv1

    var si1 = SliderInput.create({el: ab.qs('#slider1')})
    si1.setRange(0, 100)
    si1.setPosition(100, 100)
    si1.eventsAttach()

    player1.attach(bp.el)
    player1.start()
    ab.delay(1001, () => {
      console.warn('syop')
      player1.stop()
    })
    ab.delay(2001, () => {
      console.warn('set')
      player1.gotoPos(4)
    })
    ab.delay(2501, () => {
      console.warn('Hello')
      player1.start()
    })

    var player = new Player({id: 'player0'})
    player.eventsAttach()
  })
}(window))

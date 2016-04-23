/*global ab, Audio*/
(function (win) {
  var bp = win.beatPlayer = {}

  // {{{1 Keyboard
  function Keyboard(o) {
  }

  Keyboard.prototype = {
  }

  ab.mix.dom(Keyboard)

  ab.mix.handlers(Keyboard, {
    keydown: function () {
      console.warn('down', arguments)
    },
    keyup: function () {
      console.warn('up', arguments)
      if (ab.dom1 && ab.dom1parent) {
        ab.dom1parent.removeChild(ab.dom1)
        console.warn('DOM1', ab.dom1parent, ab.dom1)
        ab.append(ab.dom1parent, ab.dom1)
      }
    }
  })

  // 1}}} Keyboard

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
      var columns = []
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

  const alphaNum = "01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  function decToalphanum (num) {
    if (num >= alphaNum.length) {
      console.warn('reset num from ', num)
      num = alphaNum.length - 1
      console.warn('reset num to', num)
    }
    return alphaNum[num]

  }


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
        break;
      case 'I': // Click top row to go to position
        console.warn('I', alphanumToDec(el.innerText))
        this.gotoPos(alphanumToDec(el.innerText))
        break;
      case 'P':
        console.warn('P Instrument', el)
        var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
        break;
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
    ab.attr(this.textEl, { value: value})
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

bp.el = ab.qs('#player1')
if (!bp.el) throw new Error('BAd')
player1.render('Hello')


var state = 1
function stateHandler (nextKey) {
  switch (nextKey) {
  }
}

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

ab.ready(function () {
  console.warn('ready', bp.sounds.bd);
  console.warn('ready', bp.sounds.bd.play());
  var start = Date.now()
  var kb1 = Keyboard.create()
  kb1.eventsAttach()

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

/*global ab, __window, Audio, requestAnimationFrame*/
var bp = __window.beatPlayer = {}

ab.classes = {}

var keyboardKeys = [
  '1234567890',
  'QWERTYUIOP',
  'ASDFGHJKL',
  'ZXCVBNM,.']

// TODO Remove this
ab.mix.focus = function (AClass) {
  AClass.prototype.focus = function () {
    ab.css(this.parentEl, {
      border: '1px solid blue'
    })
  }
  AClass.prototype.unfocus = function () {
    ab.css(this.parentEl, {
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
    2: ['Q', 'R'],
    3: ['B', 'M']
  }
  this.selectedInstrument = (o.selectedInstrument || 3) + ''
}

KeyboardView.prototype = {
  tpl: function (o) {
    var rangeStart = this.rangesToIndex()
    var rangeEnd = {}
    o = o || {}
    o.classes = o.classes || this.classes || 'color1'
    return ab.templates.keyboard(keyboardKeys.map((row, j) => {
      var keys = ''
      var chars = row.split('')
      if (j === 0) return ab.templates.keyboardRow(chars)
      for (var i = 0; i < chars.length; i += 1) {
        var ch = chars[i]
        if (rangeStart[ch]) {
          console.warn('XXX', rangeStart, rangeStart[ch], rangeEnd)
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
    Object.keys(this.ranges).forEach(function (instrumentIndex) {
      var range = self.ranges[instrumentIndex]
      result[range[0]] = {}
      result[range[0]][range[1]] = instrumentIndex
    })
    return result
  },
  afterAttach: function (el) {
    // Select the active sample
    var samples = ab.qa('b', this.parentEl)
    if (this.lastInstrumentEl) ab.classRemove(this.lastInstrumentEl, 'active-instrument')
    for (var i = 0; i < samples.length; i += 1) {
      var s1 = samples[i]
	  console.warn('afterRender', s1.innerText, this.selectedInstrument)
      if (s1.innerText === this.selectedInstrument) {
        ab.classAdd(s1, 'active-instrument')
        this.lastInstrumentEl = s1
        break
      }
    }
  },
  selectSample: function (sample) {
    this.selectedInstrument = sample + ''
    this.afterAttach()
  }
}

ab.KeyboardView = KeyboardView

mixinDom(KeyboardView)
mixinHandlers(KeyboardView, {
  click: function (event, el) {
    // Instrument
    if (el.nodeName === 'B') {
      if (this.lastInstrumentEl) {
        ab.classRemove(this.lastInstrumentEl, 'active-instrument')
      }
      ab.classAdd(el, 'active-instrument')
      this.lastInstrumentEl = el
      this.selectedInstrument = el.innerText
      this.model.dispatch('SelectInstrument', this.selectedInstrument)
    // Keyboard layout
    } else if (el.nodeName === 'I') {
      var parentName = el.parentNode.nodeName
      if (parentName === 'PRE') {
        // Define range for instrument and surround with a span
        if (this.lastKeyEl) {
          ab.classRemove(this.lastKeyEl, 'active-key')
          // Add span around key range
          var begin = this.lastKeyEl
          var end = el
          if (keyKeys[begin.innerText] > keyKeys[end.innerText]) {
            begin = el
            end = this.lastKeyEl
          }
          var span = htmlEl('span', {'class': 'color' + this.selectedInstrument})
          span = insertBefore(begin.parentNode, span, begin)
          while (1) {
            var next = begin.nextSibling
            appendChild(span, begin)
            if (begin === end) break
            begin = next
            if (!begin) break
          }
          this.lastKeyEl = null
        // Mark the start of the range
        } else {
          ab.classAdd(el, 'active-key')
          this.lastKeyEl = el
        }
      } else if (parentName === 'SPAN') {
        var span = el.parentNode
        var top = span.parentNode
        while ((el = span.firstChild)) {
          insertBefore(top, el, span)
        }
        removeChild(top, span)
      }
    }
    this.focus()
  }
})

ab.mix.focus(KeyboardView)

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

keyboardKeys.join('').split('').forEach(function (k, i) {
  keyKeys[k] = i
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

ab.mix.handlers(InputHandler, 'el', {
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

// {{{1 Player  TODO Rename to PlayerView
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
  this.tpb = o.tpb || 4
  this.bar = o.bar || 4
  this.bars = this.bar

  this.tracks = []

  for (var ibar = 0; ibar < this.bars; ibar += 1) {
    this.tracks[ibar] = []
    for (var itpb = 0; itpb < this.tpb; itpb += 1) {
      this.tracks[ibar][itpb] = (o.tracks && o.tracks[ibar] && o.tracks[ibar][itpb])
      if (!this.tracks[ibar][itpb]) this.tracks[ibar][itpb] = '·'
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
    var length = this.tpb * this.bar * this.bars
    while (i < length) {
      i += 1
    }
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
    }, (this.bpm / 60) * this.bar * this.tpb * 100)
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

ab.mix.handlers(Player, 'el', {
  click: function (ev, el) {
    console.warn('You clicked', ev, el, el.parentNode)
    var rowIndex = [].slice.call(el.parentNode.childNodes).indexOf(el)
    var columnIndex
    var r1
    switch (el.nodeName) {
      case 'P':
        console.warn('P Instrument', el)
        // var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
        textInputWidth = '4rem'
      case 'B':
        textInputWidth = '1rem'
        r1 = ab.rect(el)
        var value = el.innerText
        if (!value || /^\s*$/.test(value)) value = '.'
        ab.smallInput1.popup({
          top: r1.top,
          left: r1.left,
          value: value,
          set: function (value) {
            el.innerText = value
          }
        })
        ab.lastPopUp = ab.smallInput1
        break
      case 'I': // Click top row to go to position
        console.warn('I', alphanumToDec(el.innerText))
        //TODO  this.gotoPos(alphanumToDec(el.innerText))
        break
      case 'ABBR':
        r1 = ab.rect(ab.qs('dd', el))
      case 'DT':
      case 'DD':
        r1 = ab.rect(el)
        // if (ab.lastPopUp) ab.lastPopUp.hide()
        ab.sliderInput1.popup({
          top: r1.top,
          left: r1.left,
          value: el.innerText,
          set: function (value) {
            el.innerText = value +''
          }
        })
        ab.lastPopUp = ab.sliderInput1
        break
    }
    this.focus()
  }
})
// 1}}} Player
// {{{1 InstrumentsView
function InstrumentsView (o) {
}

InstrumentsView.prototype = {
  tpl: function (o) {
    return ab.templates.instrument(o)
  }
}
mixinDom(InstrumentsView)
mixinHandlers(InstrumentsView, {
  click: function () {
    console.warn('Hello Instruments', this.model)
  }
})
// 1}}} InstrumentsView

// {{{1 Slider Input
function SliderInput (o) {
  o = o || {}
  this.el = o.el
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
    this.textEl.value = value
  },
  popup: function (o) {
    if (!this.attached) {
      this.attach(document.body)
      this.attached = true
    }
    // o.value = o.value || this.inputEl.value
    // this.detach()
    // if (o.value !== this.lastValue) this.render(o)
    // this.attach(this.parent)
    ab.css(this.el, {
      position: 'absolute',
      top: o.top + 'px',
      left: o.left + 'px'
    })
    this.sliderEl.value = o.value
    this.textEl.value = o.value
    this.setValue = o.set
    // this.lastValue = this.inputEl.value = o.value
    this.textEl.focus()
    this.textEl.select()
  }
}

ab.mix.dom(SliderInput)

ab.mix.handlers(SliderInput, 'el', {
  input: function (ev, el) {
    var v1 = this.sliderEl.value = this.textEl.value = Math.round(el.value)
    if (this.setValue) this.setValue(v1)
    ev.stopPropagation()
  },
  change: function (ev, el) {
    var v1 = this.sliderEl.value = this.textEl.value = Math.round(el.value)
    if (this.setValue) this.setValue(v1)
    ev.stopPropagation()
  },
  keydown: function (ev, el) {
    console.warn('Key i sdown', ev, el)
    ev.stopPropagation()
  }
})
// 1}}} Slider Input

// {{{1 SmallInput
function SmallInput (o) {
  
}

SmallInput.prototype = {
  template: function (o) {
    return ab.templates.smallInput(o)
  },
  afterRender: function () {
    this.inputEl = ab.qs('input[type=text]', this.el)
  },
  afterAttach: function (el) {
    ab.classRemove(this.el, 'hidden')
  },
  popup: function (o) {
    o.value = o.value || this.inputEl.value
    if (!this.attached) {
      this.attach(document.body)
      this.attached = true
    }
    this.show()
    ab.css(this.el, {
      position: 'absolute',
      top: o.top + 'px',
      left: o.left + 'px',
      'background-color': ab.color(ab.randInt(1, 100), 0x99, 0xEE),
      width: o.width || '1rem'
    })
    this.setValue = o.set
    this.lastValue = this.inputEl.value = o.value
    this.inputEl.focus()
    this.inputEl.select()
  }
}

ab.mix.dom(SmallInput)

ab.mix.handlers(SmallInput, 'el', {
  keyup: function (ev, el) {
    var key = String.fromCharCode(ev.keyCode).toLowerCase()
    if (this.setValue) this.setValue(key)
    this.hide()
    console.warn('key', key)
    return ev.stopPropagation()
  }
})

// 1}}} SmallInput

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


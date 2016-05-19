/*global __window __document Audio requestAnimationFrame htmlEl insertBefore
appendChild, removeChild mixinDom mixinHandlers css qa qs classRemove classAdd
rect attr newColor randInt type*/
var bp = __window.bp = {}

const alphaNum = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const keyboardKeys = [
  '1234567890',
  'QWERTYUIOP',
  'ASDFGHJKL',
  'ZXCVBNM,.']

const keyboardKeyMap = {}

keyboardKeys.join('').split('').forEach(function (k, i) {
  keyboardKeyMap[k] = i
})

// TODO Remove this
function mixinFocus (AClass) {
  AClass.prototype.focus = function () {
    css(this.parentEl, {
      border: '1px solid blue'
    })
  }
  AClass.prototype.unfocus = function () {
    css(this.parentEl, {
      border: 'none'
    })
  }
}

// {{{1 KeyboardView
function KeyboardView (o) {
  o = o || {}
  this.ranges = o.ranges || [
    // Assumption: The array is sorted as the keyboard
    // and intervals do not overlap
    [1, 'U', 'F'],
    [2, 'Q', 'R'],
    [3, 'B', 'M']
  ]
  o.model.selectedInstrument(o.selectedInstrument || 3)
}

KeyboardView.prototype = {
  tpl: function (o) {
    o = o || {}
    return bp.templates.keyboard(keyboardKeys.map((row, j) => {
      var keys = ''
      var chars = row.split('')
      if (j === 0) return bp.templates.keyboardRow(chars)
      for (var i = 0; i < chars.length; i += 1) {
        var ch = chars[i]
        keys += '<i>' + ch + '</i>'
      }
      return (j > 1 ? ' ' : '') + keys
    }))
  },
  // Add span around key range
  markRange: function (beginEl, endEl, instrumentNumber) {
    var begin = beginEl
    var end = endEl
    if (keyboardKeyMap[begin.innerText] > keyboardKeyMap[end.innerText]) {
      begin = endEl
      end = beginEl
    }
    this.model.selectedInstrumentRange([begin.innerText, end.innerText])
    var span = htmlEl('span', {'class': 'color' + instrumentNumber})
    span = insertBefore(begin.parentNode, span, begin)
    while (1) {
      var next = begin.nextSibling
      appendChild(span, begin)
      if (begin === end) break
      begin = next
      if (!begin) break
    }
  },
  findElTypeWithInnerText: function (elType, character) {
    var keys = qa(elType, this.parentEl)
    for (var i = 0; i < keys.length; i += 1) {
      var k1 = keys[i]
      if (k1.innerText === character) return k1
    }
  },
  afterAttach: function (el) {
    // Select the active sample
    var samples = qa('b', this.parentEl)
    if (this.lastInstrumentEl) classRemove(this.lastInstrumentEl, 'active-instrument')
    for (var i = 0; i < samples.length; i += 1) {
      var s1 = samples[i]
      console.warn('afterRender', s1.innerText, this.model.selectedInstrument())
      if (s1.innerText === this.model.selectedInstrument()) {
        classAdd(s1, 'active-instrument')
        this.lastInstrumentEl = s1
        break
      }
    }
    // Set selected ranges
    for (i = 0; i < this.ranges.length; i += 1) {
      var assignment = this.ranges[i]
      var begin = this.findElTypeWithInnerText('i', assignment[1])
      var end = this.findElTypeWithInnerText('i', assignment[2])
      this.markRange(begin, end, assignment[0])
    }
  },
  selectInstrument: function (sample, el) {
    if (!el) el = this.findElTypeWithInnerText('b', sample)
    if (this.lastInstrumentEl) {
      classRemove(this.lastInstrumentEl, 'active-instrument')
    }
    classAdd(el, 'active-instrument')
    this.lastInstrumentEl = el
    this.model.selectedInstrument(sample)
  }
}

mixinDom(KeyboardView)
mixinHandlers(KeyboardView, {
  click: function (event, el) {
    // Instrument
    if (el.nodeName === 'B') {
      this.selectInstrument(el.innerText, el)
    // Keyboard layout
    } else if (el.nodeName === 'I') {
      var parentName = el.parentNode.nodeName
      if (parentName === 'PRE') {
        // Define range for instrument and surround with a span
        if (this.lastKeyEl) {
          classRemove(this.lastKeyEl, 'active-key')
          this.markRange(this.lastKeyEl, el, this.model.selectedInstrument())
          this.lastKeyEl = null
        // Mark the start of the range
        } else {
          classAdd(el, 'active-key')
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

mixinFocus(KeyboardView)

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

// {{{1 PlayerView
bp.sounds = {
  bd: new Audio('samples/bd.wav'),
  // bd: new Audio('http://download.wavetlan.com/SVV/Media/HTTP/WAV/Media-Convert/Media-Convert_test6_PCM_Stereo_VBR_16SS_8000Hz.wav'),
  sd: new Audio('samples/sd.wav'),
  hat: new Audio('samples/hat.wav')
}

function ScoreColumns (el) {
  // console.warn(type(el));
  this.els = qa('* p', el).filter(function (el1) {
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
    if (this.lastSelectedEl) classRemove(this.lastSelectedEl, 'active')
    classAdd(this.selectedEl, 'active')
  }
}

function PlayerView (o) {
  o = o || {}
  // this.parentEl = ab.dom('<div class="player"></div>')
  // if (typeof this.parentEl === 'string') this.parentEl = ab.qs(this.parentEl)
  // if (!this.parentEl) throw new Error('Bad el ' + this.parentEl)
  // this.scoreColumns = new ScoreColumns(this.parentEl)

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
  console.warn('PlayerView', this)
}

PlayerView.prototype = {
  tpl: function (o) {
    console.warn('PlayerView template', o)
    var t = bp.templates
    o.settings = t.settings(o.settings)
    o.score = bp.templates.scoreSpan([1, 2, 3, 4, 5, 6, 7, 8, 9, 'A'])
    o.instruments = t.instruments(o.instruments)
    o.columns = t.columnEmpty() + this.tracks.map(t.column).join('\n')
    var player = t.player(o)
    console.warn('PlayerView Template:', player, o)
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

mixinDom(PlayerView)
mixinFocus(PlayerView)

PlayerView.prototype.unfocus = function () {
  console.warn('aa', this.parentEl)
  css(this.parentEl.childNodes[0], {
    border: 'none'
  })
  if (bp.lastPopUp) bp.lastPopUp.hide()
}
PlayerView.prototype.focus = function () {
  css(this.parentEl.childNodes[0], {
    border: '1px solid blue'
  })
  if (bp.lastPopUp) {
    bp.lastPopUp.show()
    bp.lastPopUp.inputEl.select()
  }
}

PlayerView.prototype.keyLeft = function (ev, el) {
  console.warn(ev, el)
}
PlayerView.prototype.keyRight = function (ev, el) {
  console.warn(ev, el)
}
PlayerView.prototype.keyUp = function (ev, el) {
  console.warn(ev, el)
}
PlayerView.prototype.keyDown = function (ev, el) {
  console.warn(ev, el)
}

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

mixinHandlers(PlayerView, {
  click: function (ev, el) {
    // console.warn('You clicked', ev, el, el.parentNode)
    // var rowIndex = [].slice.call(el.parentNode.childNodes).indexOf(el)
    // var columnIndex
    var r1
    var textInputWidth
    switch (el.nodeName) {
      case 'P':
        console.warn('P Instrument', el)
        // var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
        textInputWidth = '4rem'
        // falls through
      case 'B':
        textInputWidth = '1rem'
        r1 = rect(el)
        var value = el.innerText
        if (!value || /^\s*$/.test(value)) value = '.'
        bp.smallInput1.popup({
          top: r1.top,
          left: r1.left,
          value: value,
          width: textInputWidth,
          set: function (value) {
            el.innerText = value
          }
        })
        bp.lastPopUp = bp.smallInput1
        break
      case 'I': // Click top row to go to position
        console.warn('I', alphanumToDec(el.innerText))
        // TODO  this.gotoPos(alphanumToDec(el.innerText))
        break
      case 'ABBR':
        r1 = rect(qs('dd', el))
        // falls through
      case 'DT':
        // falls through
      case 'DD':
        r1 = rect(el)
        // if (bp.lastPopUp) bp.lastPopUp.hide()
        bp.sliderInput1.popup({
          top: r1.top,
          left: r1.left,
          value: el.innerText,
          set: function (value) {
            el.innerText = value + ''
          }
        })
        bp.lastPopUp = bp.sliderInput1
        break
    }
    this.focus()
  }
})
// 1}}} PlayerView

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

function InputHandler (o) {
  if (!o.keyboardView) throw new Error('Need o.keyboardView')
  if (!o.player) throw new Error('o.player')
  if (!o.model) throw new Error('o.model')
  this.keyboardView = o.keyboardView
  this.player = o.player
  this.parentEl = __document
}

InputHandler.prototype = {
}

mixinHandlers(InputHandler, {
  keydown: function (ev, el) {
    var code = ev.which
    console.warn('Key', code, ev.charCode, String.fromCharCode(code))
    if (code <= key9 && code >= key0) {
      this.keyboardView.selectInstrument(String.fromCharCode(code))
    } else if (code === keyUp) {
      console.warn('keyUp')
      if (bp.lastPopUp && bp.lastPopUp.keyUp) bp.lastPopUp.keyUp()
      ev.preventDefault()
    } else if (code === keyDown) {
      console.warn('keyDown')
      if (bp.lastPopUp && bp.lastPopUp.keyDown) bp.lastPopUp.keyDown()
      ev.preventDefault()
    } else if (code === keyLeft) {
      console.warn('keyLeft')
      if (bp.lastPopUp && bp.lastPopUp.keyLeft) bp.lastPopUp.keyLeft()
      ev.preventDefault()
    } else if (code === keyRight) {
      console.warn('keyRight')
      if (bp.lastPopUp && bp.lastPopUp.keyRight) bp.lastPopUp.keyRight()
      ev.preventDefault()
    } else if (code === keySpace) {
      console.warn('keySpace')
      ev.preventDefault()
    } else if (code === keyEsc) {
      console.warn('keyEsc')
      if (bp.lastPopUp) bp.lastPopUp.inputEl.hide()
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
      if (keyboardKeyMap[k]) {
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

// {{{1 InstrumentsView
function InstrumentsView (o) {
  o.model.subscribe('SelectInstrument', this.selectInstrumentNumber, this)
  o.model.subscribe('SelectInstrumentRange', this.selectInstrumentRange, this)
}

InstrumentsView.prototype = {
  tpl: function (o) {
    return bp.templates.instrument(o)
  },
  selectInstrumentNumber: function selectInstrumentNumber (number) {
    this.update(this.model.instrument(number))
  },
  selectInstrumentRange: function selectInstrumentRange (range) {
    console.warn('Range', this.model.instrument(this.model.selectedInstrument()))
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
  if (typeof this.el === 'string') this.el = qs(this.el)
  this.sliderEl = qs('input[type=range]', this.el)
  this.textEl = qs('input[type=text]', this.el)
  if (!this.el) throw new Error('Need o.el')
  if (!this.sliderEl) throw new Error('Need o.sliderEl')
  if (!this.textEl) throw new Error('Need o.textEl')
}

SliderInput.prototype = {
  tpl: function (o) {
    return bp.templates.sliderInput(o)
  },
  setRange: function (start, stop, value) {
    value = value || (start + stop) / 2
    attr(this.sliderEl, {min: start,
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
    css(this.el, {
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

mixinDom(SliderInput)

mixinHandlers(SliderInput, {
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
  tpl: function (o) {
    return bp.templates.smallInput(o)
  },
  afterRender: function () {
    this.inputEl = qs('input[type=text]', this.el)
  },
  afterAttach: function (el) {
    classRemove(this.el, 'hidden')
  },
  popup: function (o) {
    o.value = o.value || this.inputEl.value
    if (!this.attached) {
      this.attach(document.body)
      this.attached = true
    }
    this.show()
    css(this.el, {
      position: 'absolute',
      top: o.top + 'px',
      left: o.left + 'px',
      'background-color': newColor(randInt(1, 100), 0x99, 0xEE),
      width: o.width || '1rem'
    })
    this.setValue = o.set
    this.lastValue = this.inputEl.value = o.value
    this.inputEl.focus()
    this.inputEl.select()
  }
}

mixinDom(SmallInput)

mixinHandlers(SmallInput, {
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

mixinDom(Samples)

Samples.prototype = {
  draw: function (el) {
    bp.templates.keyboard({
    })
  }
}

// 1}}} Samples


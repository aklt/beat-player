/*global bp __document requestAnimationFrame htmlEl insertBefore
  appendChild, removeChild mixinDom mixinHandlers css qa qs classRemove classAdd
  rect attr nextSibling prevSibling $id mixinHideShow BeatModel
  eachPush $t $ts
*/

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

// {{{1 KeyboardView
function KeyboardView (o) {
  o = o || {}
  this.ranges = o.ranges || [
    // Assumption: The array is sorted as the keyboard
    // and intervals do not overlap
    // [1, 'U', 'F'],
    // [2, 'Q', 'R'],
    // [3, 'B', 'M']
  ]
  o.model.selectedInstrument(o.selectedInstrument || 1)
  // properties on o added
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
      // console.warn('afterRender', s1.innerText, this.model.selectedInstrument())
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
        this.model.selectedInstrumentRange()
      }
    }
    this.focus()
  }
})

mixinFocus(KeyboardView)

KeyboardView.prototype.keyLeft = function (ev, el) {
  console.warn('KeyboardView', ev, el)
}
KeyboardView.prototype.keyRight = function (ev, el) {
  console.warn('KeyboardView', ev, el)
}
KeyboardView.prototype.keyUp = function (ev, el) {
  console.warn('KeyboardView', ev, el)
}
KeyboardView.prototype.keyDown = function (ev, el) {
  console.warn('KeyboardView', ev, el)
}
// 1}}} KeyboardView

// {{{1 ScoreColumns
// TODO Get rid of this
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
// 1}}} ScoreColumns

// {{{1 PlayerView
function PlayerView (o) {
}

// {{{2 templates
function scoreSpanTemplate (length, tpb) {
  var result = []
  for (var i = 0; i < length; i += 1) {
    if (i % tpb === 0) result.push('&nbsp;')
    result.push(decToalphanum(i + 1))
  }
  return $t('span', $ts('i', result))
}

const emptyCol = $t('p', $t('b', '&nbsp;'))

// 2}}} templates

PlayerView.prototype = {
  tpl: function (o) {
    var m = this.model
    var t = extend({tracks: this.tracks,
                    length: m.patternLength(),
                    tpb: m.tpb()}, o)
    return [
      $t('div', {'class': 'settings'},
        $t('dl',
          eachPush([['Beats Per Minute', 'BPM', 'bpm'],
            ['Ticks Per Beat', 'TPB', 'tpb'],
            ['Total Beats', 'Beats', 'beats']], function (i, val) {
            return $t('dt',
              $t('abbr', {title: val[0]}, val[1]),
              $t('dd', t.settings[val[2]]))
          }))),
      $t('div', {'class': 'instruments'},
        eachPush(t.instruments, function (i, i1) {
          return $t('p', i1.name)
        })),
      $t('div', {'class': 'score'},
        scoreSpanTemplate(o.length, t.tpb),
        $t('div', {'class': 'score-columns'},
          eachPush(t.tracks, function (i, val) {
            var result = ''
            if (i % t.tpb === 0) result += emptyCol
            result += $t('p', $ts('b', val))
            return result
          })))
    ].join('\n')
  },
  renderModel: function () {
    // Extract the parts needed for the playerview
    var m = this.model
    if (!m) throw new Error('Need model')

    this.tracks = []
    var instruments = m.instruments()

    console.warn('=============', instruments, m.model.instruments)

    var patternLength = m.patternLength()
    for (var i = 0; i < instruments.length; i += 1) {
      this.tracks.push(charArray(patternLength, '.'))
      // TODO Instrument lookup in pattern
    }

    var patterns = m.patterns()

    // FIXME This is an ugly hack to handle initial state of the PlayerView
    if (patterns) {
      var pats = Object.keys(patterns)
      for (i = 0; i < pats.length; i += 1) {
        var p = patterns[pats[i]]
        var cols = Object.keys(p)
        for (var j = 0; j < cols.length; j += 1) {
          this.tracks[pats[i]][cols[j]] = p[cols[j]]
        }
      }
      this.tracks = transpose(this.tracks)
    }

    var o = {
      settings: {
        bpm: m.bpm(),
        tpb: m.tpb(),
        beats: m.beats()
      },
      instruments: m.instruments()
    }
    this.render(o)
  },
  afterAttach: function () {
    if (!this.parentEl) throw new Error('Bad el ' + this.parentEl)
    this.scoreColumns = new ScoreColumns(this.parentEl)
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

function decToalphanum (num) {
  if (num >= alphaNum.length) {
    console.warn('reset num from ', num)
    num = alphaNum.length - 1
    console.warn('reset num to', num)
  }
  return alphaNum[num]
}

function alphanumToDec (anum) {
  var result = alphaNum.indexOf(anum + '')
  if (result < 0) throw new Error('TODO Beat is too long')
  return result
}

mixinHandlers(PlayerView, {
  click: function (ev, el) {
    // console.warn('You clicked', ev, el, el.parentNode)
    // var rowIndex = [].slice.call(el.parentNode.childNodes).indexOf(el)
    // var columnIndex
    var r1
    switch (el.nodeName) {
      case 'P':
        console.warn('P Instrument', el)
        // var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
        // falls through
      case 'B':
        r1 = rect(el)
        var value = el.innerText
        if (!value || /^\s*$/.test(value)) value = '.'
        bp.live.ti1.popup({
          top: r1.top,
          left: r1.left,
          width: r1.width,
          value: value,
          set: function (value) {
            el.innerText = value
          }
        })
        bp.lastPopUp = bp.live.ti1
        break
      case 'I': // Click top row to go to position
        console.warn('I', alphanumToDec(el.innerText))
        this.gotoPos(alphanumToDec(el.innerText))
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
    return ev.stopPropagation()
  }
})

function charArray (length, character) {
  character = character || '.'
  var result = []
  for (var i = 0; i < length; i += 1) {
    result.push(character)
  }
  return result
}

function transpose (matrix) {
  var height = matrix.length
  var width = matrix[0].length
  var result = new Array(width)
  for (var i = 0; i < width; i += 1) {
    result[i] = new Array(height)
    for (var j = 0; j < height; j += 1) {
      result[i][j] = matrix[j][i]
    }
  }
  return result
}

// 1}}} PlayerView

// {{{1 BeatsView
function BeatsView (o) {
  this.collection = {}
}

BeatsView.prototype = {
  tpl: function (o) {
    return $t('div',{
        id: o.id,
        'class': 'beatsView'
      },
      $t('h3', 'Select a Beat'),
      $t('select', { type: 'multi' },
        eachPush(o.options, function (i, opt) {
          return $t('option', opt)
        }))
      )
  },
  afterRender: function () {
    console.warn('AFTER', this.tpl({options: [1, 2, 3], id: 'cc'}))
  }
}

mixinDom(BeatsView)

mixinHandlers(BeatsView, {
  click: function (ev, el) {
    this.model.load('data/' + el.value + '.beat', function (err, model) {
      console.warn('Loaded', err, model)
    })
  }
})
// 1}}}

// {{{1 InstrumentsView
function InstrumentsView (o) {
  o.model.subscribe('SelectInstrument', this.selectInstrumentNumber, this)
  o.model.subscribe('SelectInstrumentRange', this.selectInstrumentRange, this)
}

InstrumentsView.prototype = {
  tpl: function (o) {
    return [
      $t('h4', 'Instrument ' + o.number),
      $t('dl',
        $t('dt', 'Name'),
        $t('dd', o.name),
        $t('dt', 'Url'),
        $t('dd', o.url),
        o.range ? ($t('dt', 'Range') + $t('dd', o.range)) : '',
        o.buffer ? ($t('dt', 'Time') + $t('dd', Math.round(o.buffer.duration * 100) / 100)) : ''
        )
    ].join('\n')
  },
  selectInstrumentNumber: function (number) {
    this.update(this.model.instrument())
  },
  selectInstrumentRange: function (range) {
    this.update(this.model.instrument())
  }
}

mixinDom(InstrumentsView)

mixinHandlers(InstrumentsView, {
  click: function (ev, el) {
    var name = el.nodeName
    var dtEl
    var ddEl
    if (name === 'DT') {
      dtEl = el
      ddEl = nextSibling(el)
    } else if (name === 'DD') {
      dtEl = prevSibling(el)
      ddEl = el
    }
    if (dtEl && ddEl) {
      var r1 = rect(ddEl)
      bp.live.ti1.popup({
        top: r1.top,
        left: r1.left,
        width: r1.width,
        value: ddEl.innerText,
        set: function (value) {
          ddEl.innerText = value
        }
      })
    }
  }
})
// 1}}} InstrumentsView

// {{{1 SliderInput
function SliderInput (o) {
  o = o || {}
  this.parentEl = $id(o.id)
  this.sliderEl = qs('input[type=range]', this.parentEl)
  this.textEl = qs('input[type=text]', this.parentEl)
  if (!this.parentEl) throw new Error('Need o.id')
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

// {{{1 TextInput
function TextInput (o) {
  this.parentEl = $id(o.id)
  if (!this.parentEl) throw new Error('Need parentEl')
  this.inputEl = qs('input', this.parentEl)
  this.eventsAttach()
}

TextInput.prototype = {
  popup: function (o) {
    var value = o.value || this.inputEl.value
    css(this.parentEl, {
      position: 'absolute',
      top: o.top + 'px',
      left: o.left + 'px',
      width: o.width + 'px'
    })
    this.setValue = o.set
    this.lastValue = this.inputEl.value = value
    this.inputEl.focus()
    this.inputEl.select()
    this.value = ''
    this.show()
  },
  popdown: function () {
    this.inputEl.blur()
    this.hide()
  },
  isDone: function () {
    return this.value.length === 1
  }

}

TextInput.create = function (o) {
  return new TextInput(o)
}

TextInput.create = function (o) {
  return new TextInput(o)
}

mixinHideShow(TextInput)

mixinHandlers(TextInput, {
  keyup: function (ev, el) {
    var key = String.fromCharCode(ev.keyCode).toLowerCase()
    if (/^[\s\b]*$/.test(key)) key = '.'
    if (this.setValue) this.setValue(key)
    if (this.isDone()) this.popdown()
  },
  keydown: function (ev) {
    // Prevent InputHandler from changing instrument
    return ev.stopPropagation()
  }
})
// 1}}} TextInput

// {{{1 Samples
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

bp.test.player = function () {
  var bm1 = new BeatModel()
  bm1.load('data/beat1.beat', function (err, model) {
    if (err) throw err
    var pl1 = PlayerView.create({
      model: model
    })
    pl1.renderModel()
    pl1.attach('#test1')
  })
}

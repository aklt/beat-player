/*global bp __document requestAnimationFrame htmlEl insertBefore
  appendChild, removeChild mixinDom mixinHandlers css qa qs classRemove classAdd
  rect attr nextSibling prevSibling $id mixinHideShow BeatModel
  eachPush $t $ts extend
*/

// TODO Grid https://www.reddit.com/r/Frontend/comments/4lkww8/grid_system_research/

const alphaNum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const keyboardKeys = [
  '1234567890',
  'QWERTYUIOP',
  'ASDFGHJKL',
  'ZXCVBNM,.']

const keyboardKeyMap = {}

keyboardKeys.join('').split('').forEach(function (k, i) {
  keyboardKeyMap[k] = i
})

// {{{1 InputHandler

// TODO CTRL + 1-9:  Select instrument, focus instruments
//      1-9 a-z A-Z: go to position, focus player
//
//
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

var IH_INIT = 1

var IH_END = 4
var ih_state = IH_INIT

mixinHandlers(InputHandler, {
  keydown: function (ev, el) {
    var code = ev.which
    console.warn('Key', code, ev.charCode, String.fromCharCode(code))
    switch (ih_state) {
      case IH_INIT:
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
          var obj = bp.live.stepFocus.prev()
          console.warn('keyLeft', obj)
          obj.focus()
          if (bp.lastPopUp && bp.lastPopUp.keyLeft) bp.lastPopUp.keyLeft()
          ev.preventDefault()
        } else if (code === keyRight) {
          var obj = bp.live.stepFocus.next()
          obj.focus()
          console.warn('keyRight', obj)
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
        break;
      case IH_END:
        break
      default:
        console.warn('Unknown ih_state', ih_state)
        break
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

createView(KeyboardView, {
  tpl: function (o) {
    o = o || {}
    return bp.templates.keyboard(keyboardKeys.map(function (row, j) {
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
  afterAttach: function (el) {
    // Select the active sample
    var samples = qa('b', this.parentEl)
    if (this.lastInstrumentEl) classRemove(this.lastInstrumentEl, 'active-instrument')
    for (var i = 0; i < samples.length; i += 1) {
      var s1 = samples[i]
	  var selected = this.model.selectedInstrument()
      if (s1.innerText === selected) {
        classAdd(s1, 'active-instrument')
        this.lastInstrumentEl = s1
		this.vmSave({instrument: i})
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
  renderModel: function () {
    // TODO Render model
    this.render({})
  },
  vmSave: function () {

  },
  vmLoad: function () {
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
  selectInstrument: function (sample, el) {
    if (!el) el = this.findElTypeWithInnerText('b', sample)
    if (this.lastInstrumentEl) {
      classRemove(this.lastInstrumentEl, 'active-instrument')
    }
    classAdd(el, 'active-instrument')
    this.lastInstrumentEl = el
    this.model.selectedInstrument(sample)
  }, 

  // Keys
  keyLeft: function (ev, el) {
    console.warn('KeyboardView', ev, el)
  },
  keyRight: function (ev, el) {
    console.warn('KeyboardView', ev, el)
  },
  keyUp: function (ev, el) {
    console.warn('KeyboardView', ev, el)
  },
  keyDown: function (ev, el) {
    console.warn('KeyboardView', ev, el)
  }

}, {
  // Handlers
  click: function (event, el) {
    this.focus()
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
}, {
  // Args
  id: 'keyboard'
})

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
  console.warn('ScoreColumns', this)
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

// {{{1 Settings

function SettingsView () {
}

createView(SettingsView,  {
  tpl: function (o) {
    return $t('div', {'class': 'settings'},
      $t('dl',
        eachPush([{title: 'Beats Per Minute', abbr: 'BPM', name: 'bpm'},
          {title: 'Ticks Per Beat', abbr: 'TPB', name: 'tpb'},
          {title: 'Total Beats', abbr: 'Beats', name: 'beats'}], function (i, val) {
          return $t('dt',
            $t('abbr', {title: val.title}, val.abbr),
            $t('dd', o[val.name]))})))
  },
  renderModel: function (o) {
	this.render(o)
  }
}, {
}, {
  id: 'settings'
})


// 1}}}
//
// {{{1 PlayerView
function scoreSpanTemplate (length, tpb) {
  console.warn('scoreSpan', length, tpb)
  var result = []
  for (var i = 0; i < length; i += 1) {
    if (i % tpb === 0) result.push('&nbsp;')
    result.push(decToalphanum(i + 1))
  }
  return $t('span', $ts('i', result))
}

const emptyCol = $t('p', $t('b', '&nbsp;'))

function PlayerView (o) {
}

createView(PlayerView, {
  tpl: function (o) {
    var m = this.model
    var t = extend({tracks: this.model.tracks,
                    length: m.patternLength(),
                    tpb: m.tpb()}, o)
    return [
      $t('div', {'class': 'instruments'},
        eachPush(t.instruments, function (i, i1) {
          return $t('p', i1.name)
        })),
      $t('div', {'class': 'score'},
        scoreSpanTemplate(t.length, t.tpb),
        $t('div', {'class': 'score-columns'},
          eachPush(t.tracks, function (i, val) {
            var result = ''
            if (i % t.tpb === 0) result += emptyCol
            return [result, $t('p', eachPush(val, function (j, val) {
              return $t('b', {'data-pos': i + ',' + j}, val)
            }))]
          })))
    ].join('\n')
  },
  renderModel: function () {
    // Extract the parts needed for the playerview
    var m = this.model
    if (!m) throw new Error('Need model')

    var instruments = m.instruments()
    var patternLength = m.patternLength()
    var tracks = []
    for (var i = 0; i < instruments.length; i += 1) {
      tracks.push(charArray(patternLength, '.'))
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
          tracks[pats[i]][cols[j]] = p[cols[j]]
        }
      }
      m.tracks = transpose(tracks)
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
  reAttach: function () {
    this.detach()
    this.renderModel()
    this.attach()
  },
  gotoPos: function (pos) {
    this.scoreColumns.selectedIndex = -1
    this.scoreColumns.step(pos)
    this.model.position(pos)
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
  },

  // Keys
  keyLeft: function (ev, el) {
    console.warn(ev, el)
  },
  keyRight: function (ev, el) {
    console.warn(ev, el)
  },
  keyUp: function (ev, el) {
    console.warn(ev, el)
  },
  keyDown: function (ev, el) {
    console.warn(ev, el)
  }
}, {
// Handlers
  click: function (ev, el) {
    // console.warn('You clicked', ev, el, el.parentNode)
    // var rowIndex = [].slice.call(el.parentNode.childNodes).indexOf(el)
    // var columnIndex
    this.focus()
    var r1
    var live = bp.live
    var self = this
    switch (el.nodeName) {
      case 'P':
        console.warn('P Instrument', el)
        // var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
        // falls through
      case 'B':
        r1 = rect(el)
        var value = el.innerText
		var pos = attr(el, 'data-pos')
		if (!pos) return
		console.warn('POS', pos)
        if (!value || /^\s*$/.test(value)) value = '.'
        live.textInput1.popup({
          top: r1.top,
          left: r1.left,
          width: r1.width,
          value: value,
          getInput: function (ev) {
            // return string typed
            console.warn('getInput', ev)
          },
          set: function (value) {
            var pos = attr(el, 'data-pos')
            console.warn('textInput1 set', pos, value)
            self.model.note(pos, value)
            el.innerText = value
          }
        })
        bp.lastPopUp = bp.live.textInput1
        break
      case 'I': // Click top row to go to position
        console.warn('I', alphanumToDec(el.innerText))
        this.gotoPos(alphanumToDec(el.innerText))
        ev.preventDefault()
        ev.stopPropagation()
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
}, {
  // Default instance args
  id: 'player1'
})

// PlayerView.prototype.unfocus = function () {
  // css(this.parentEl.childNodes[0], {
    // border: 'none'
  // })
  // if (bp.lastPopUp) bp.lastPopUp.hide()
// }
// PlayerView.prototype.focus = function () {
  // css(this.parentEl.childNodes[0], {
    // border: '1px solid blue'
  // })
  // if (bp.lastPopUp) {
    // bp.lastPopUp.show()
    // bp.lastPopUp.inputEl.select()
  // }
// }

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

// {{{1 ControlsView
function ControlsView (o) {
}

const controlChars = {
  play: { ch: '▷', css: 'font-size: 150%' },
  play2: { ch: '►', css: 'font-size: 150%' },
  stop: { ch: '▆', css: 'font-size: 150%' },
  stop2: { ch: '▆', css: 'font-size: 150%' },
  left: { ch: '⬅', css: 'font-size: 150%' },
  right: { ch: '➡', css: 'font-size: 150%' },
  // right: { ch: '→', css: 'font-size: 150%' },
  pause: { ch: '▍▍', css: 'font-size: 116%; vertical-align: center; letter-spacing: -0.3rem' }
}

function controlsSpan (controlChars) {
  var result = []
  ;['left', 'play', 'pause', 'right'].forEach(function (buttonName) {
    result.push($t('button', {style: controlChars[buttonName].css}, controlChars[buttonName].ch))
  })
  return result
}

function htmlControls (o) {
  // if (o.playing) play = '►'
  return $t('div', {'class': 'controls'}, controlsSpan(controlChars))
}

createView(ControlsView, {
  tpl: function (o) {
    return htmlControls(o)
  },
  renderModel: function () {
    // TODO Render model
    this.render({})
  }
}, {
  click: function (ev, el) {
    console.warn('click', this)
  }
}, {
  id: 'controls'
})

// 1}}} ControlsView

// {{{1 BeatsView
function BeatsView (o) {
  this.collection = {}
}

createView(BeatsView, {
  tpl: function (o) {
    return $t('span', 'Beat',
      $t('select', { type: 'multi' },
        eachPush(o.options, function (i, opt) {
          return $t('option', opt)
        })))
  },
  renderModel: function (o) {
	this.render(o)
  },
  afterRender: function () {
    console.warn('AFTER', this.parentEl)
  }
}, {
  click: function (ev, el) {
    this.focus()
    if (el.value) {
      this.model.loadBeat('data/' + el.value + '.beat', function (err, model) {
        bp.live.playerView1.gotoPos(1)
      })
    }
  }
}, {
  id: 'beatsView'
})

// 1}}}

// {{{1 InstrumentsView
function InstrumentsView (o) {
}

createView(InstrumentsView, {
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
  renderModel: function () {
    // TODO Render model
    this.render({})
  },
  selectInstrumentNumber: function (number) {
    this.update(this.model.instrument())
  },
  selectInstrumentRange: function (range) {
    this.update(this.model.instrument())
  }
}, {
  click: function (ev, el) {
    this.focus()
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
      bp.live.textInput1.popup({
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
}, {
  id: 'instruments'
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
    // this.textEl.focus()
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
    console.warn('TextInput popup', o)
    var value = o.value || this.inputEl.value
    css(this.parentEl, {
      position: 'absolute',
      top: o.top + 'px',
      left: o.left + 'px',
      width: o.width + 'px'
    })
    this.setValue = o.set
    this.lastValue = this.inputEl.value = value
    // this.inputEl.focus()
    this.inputEl.select()
    this.value = ''
    this.show()
  },
  popdown: function () {
    // this.inputEl.blur()
    this.hide()
  },
  isDone: function () {
    return this.value.length === 1
  },
  setValue: function (val) {
    console.warn('setValue', val)
    this.value = val
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
    this.popdown()
    console.warn('TextInput keyup', key)
  },
  keydown: function (ev) {
    // Prevent InputHandler from changing instrument
    return ev.stopPropagation()
    console.warn('TextInput keydown', ev)
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
  bm1.loadBeat('data/beat1.beat', function (err, model) {
    if (err) throw err
    var pl1 = PlayerView.create({
      model: model
    })
    pl1.renderModel()
    pl1.attach('#test1')
  })
}

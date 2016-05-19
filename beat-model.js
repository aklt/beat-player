// # BeatModel
//
// Represents the model of the current beat.
//
// Holds all data of the current beat and is referenced from all Views.
//
// TODO Add subscriptions to events
function BeatModel (text) {
  this.model = {
    instruments: []
  }
  this.subscriptions = {}
  if (typeof text === 'string') this.readBeatText(text)
}

var subscriptionEvents = {
  NewText: 1,
  ChangeBpm: 1,
  ChangeTpb: 1,
  ChangeBeats: 1,
  ChangeNote: 1,
  SelectInstrument: 1
}

BeatModel.prototype = {
  subscribe: function (ev, cb, context) {
    if (!subscriptionEvents[ev]) throw new Error('Illegal event name ' + ev)
    if (!this.subscriptions[ev]) this.subscriptions[ev] = []
    if (!context) context = this
    this.subscriptions[ev].push([cb, context])
  },
  dispatch: function (ev, data) {
    if (!subscriptionEvents[ev]) throw new Error('Illegal subscription event name ' + ev)
    var cbs = this.subscriptions[ev] || []
    if (!cbs.disabled) {
      for (var i = 0; i < cbs.length; i += 1) {
        var cb = cbs[i]
        cb[0].call(cb[1], data)
      }
    }
  },
  // Read a text pattern without instruments
  readBeatText: function (text) {
    var patterns = this.model.patterns = {}
    var patternIndex = 0
    var patternInstruments = {}
    var lines = text.split(/\n/)
    var patternLpb
    var patternBars
    var instrument
    var line
    for (var i = 0; i < lines.length; i += 1) {
      line = lines[i]
      if (/^\s*$/.test(line)) continue
      if (/^--/.test(line)) break
      var idx = line.indexOf(':')
      if (idx < 0) throw new Error('Bad pattern format on line ' + i)
      instrument = line.slice(0, idx).trim()
      patternInstruments[instrument] = {}
      line = line.slice(idx + 1).trim()
      var rawChars = line.split('')
      var chars = []
      var k
      var ch
      var tpb = -1
      var beats = 0
      var lastLpb = -1
      for (k = 0; k < rawChars.length; k += 1) {
        ch = rawChars[k]
        if (ch === ' ') {
          beats += 1
          if (tpb === -1) {
            tpb = k
            lastLpb = k
          } else {
            if (k - lastLpb - 1 !== tpb) throw new Error('Bad tpb ' + lastLpb + ' ' + k)
          }
        } else {
          chars.push(ch)
        }
      }
      patterns[patternIndex] = {}
      for (k = 0; k < chars.length; k += 1) {
        ch = chars[k]
        if (ch !== '.') {
          patterns[patternIndex][k] = ch
          patternInstruments[instrument][ch] = patternIndex
        }
      }
      patternIndex += 1
      beats += 1
      patternLpb = tpb
      patternBars = beats
    }
    this.model.tpb = patternLpb
    this.model.beats = patternBars

    // Read samples/instruments
    i += 1
    var instruments = {}
    instrument = null
    var m
    for (; i < lines.length; i += 1) {
      line = lines[i]
      if (/^\s*$/.test(line)) continue

      // instrument name
      m = /^(\w+[\w\s]+):/.exec(line)
      if (m) {
        instrument = m[1].trim()
        instruments[instrument] = {}
        if (!patternInstruments[instrument]) {
          console.warn('Unused instrument', instrument)
        }
        continue
      }

      // instrument properties
      m = /^\s+([\w]+):(.*)/.exec(line)
      if (m) {
        if (!instrument) {
          throw new Error('Expected an instrument name at line ' + i + 1)
        }
        instruments[instrument][m[1]] = m[2].trim()
      }
    }

    var ins = this.model.instruments = {}
    Object.keys(patternInstruments).forEach(function (name, i) {
      var obj = {
        name: name
      }
      if (!instruments[name]) {
        throw new Error('Undefined instrument used: ' + name)
      }
      for (var k in instruments[name]) {
        obj[k] = instruments[name][k]
      }
      ins[i] = obj
    })
    var cb = this.subscriptions.NewText
    if (typeof cb === 'function') cb(this)
  },
  // TODO Return a text string representing the pattern
  getPattern: function () {

  },
  instruments: function (changeUrls) {
    if (!changeUrls) return this.model.instruments
    throw new Error('TODO: set instruments')
  },
  patterns: function (newPatterns) {
    if (!newPatterns) return this.model.patterns
    throw new Error('TODO: set patterns')
  },
  patternLength: function (newLength) {
    if (!newLength) return this.tpb() * this.beats()
    throw new Error('TODO: set patternLength')
  },
  // ## Modifying the model with getters and setters
  instrument: function (number) {
    return this.model.instruments[number]
  },
  selectedInstrument: function (number) {
    if (!number) return this.model.selectedInstrument
    number += ''
    this.model.selectedInstrument = number
    this.dispatch('SelectInstrument', number)
  },
  instrumentUrl: function (i, newUrl) {
    if (!newUrl) return this.model.instruments[i]
    this.model.instruments[i].url = newUrl
    var cb = this.subscriptions.ChangeUrl
    if (typeof cb === 'function') cb(this)
  },
  instrumentName: function (i, newName) {
    if (!newName) return this.model.instruments[i].name
    this.model.instruments[i].name = newName
    var cb = this.subscriptions.ChangeName
    if (typeof cb === 'function') cb(this)
  },
  toString: function () {
    return JSON.stringify(this.model, 0, 2)
  }
}

function mixinGetSet (AClass, prop, defaultValue) {
  AClass.prototype[prop] = function (value) {
    var change
    if (typeof value !== 'undefined') {
      this.model[prop] = value
      change = true
    }
    if (typeof this.model[prop] === 'undefined') {
      this.model[prop] = defaultValue
      change = true
    }
    if (change) {
      var cb = this.subscriptions['Change' + ucfirst(prop)]
      if (typeof cb === 'function') cb()
    }
    return this.model[prop]
  }
}

mixinGetSet(BeatModel, 'bpm', 100)
mixinGetSet(BeatModel, 'tpb',   4)
mixinGetSet(BeatModel, 'beats', 4)

function ucfirst (s) {
  return s[0].toUpperCase() + s.slice(1)
}


// test
//
// TODO: encapsulate pattern block in '--'
var beat1 = `
Bass Drum: b... b... b...
Snare:     ..s. ..s. .s.s
HiHat:     x.x. x.x. .x.x
--
Bass Drum:
  url: samples/bd.wav

Snare:
  url: samples/sd.wav

HiHat:
  url: samples/hat.wav
`

var b1 = new BeatModel()

b1.readBeatText(beat1)
console.warn(JSON.stringify(b1, 0, 2))

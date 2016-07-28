/*global __window extend xhr AudioContext webkitAudioContext mixinGetSet type*/
// # BeatModel
//
// Represents the model of the current beat.
//
// Holds all data of the current beat and is referenced from all Views.

// TODO Don't expose bp.live
var bp = __window.bp = {
  live: {},
  test: {},
  focus: {}
}

function BeatModel (o) {
  o = o || {}
  this.model = {
    instruments: []
  }
  this.patternInstruments = {}
  this.subscriptions = {}
  this.model = extend({}, this.model, o)
  if (typeof o.text === 'string') this.readBeatText(o.text)
}

BeatModel.defaultInstrument = {
  name: 'Unknown Instrument',
  url: 'Unknown URL',
  range: null
}

var subscriptionEvents = {
  NewText: 1,
  ChangeBpm: 1,
  ChangeTpb: 1,
  ChangeBeats: 1,
  ChangeNote: 1,
  GotoPos: 1,
  SelectInstrument: 1,
  SelectInstrumentRange: 1,
  LoadedSamples: 1,
  play: 1,
  pause: 1,
  stop: 1,
  forward: 1,
  back: 1,
  step: 1
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
    console.warn('dispatch', ev, data)
    if (!cbs.disabled) {
      for (var i = 0; i < cbs.length; i += 1) {
        var cb = cbs[i]
        console.warn('  call', cb[0].name, data)
        cb[0].call(cb[1], data)
      }
    }
  },
  enable: function (evName) {
    var o = this.subscriptions[evName]
    if (!o) throw new Error('Need model.subscriptions[' + evName + ']')
    o.disabled = false
  },
  disable: function (evName) {
    var o = this.subscriptions[evName]
    if (!o) throw new Error('Need model.subscriptions[' + evName + ']')
    o.disabled = true
  },
  // Read a text pattern without instruments
  readBeatText: function (text) {
    var parts = text.split(/^--.*/m)
    if (parts.length < 2) throw new Error('Need at least global anmd beat parts')
    if (parts.length >= 2) {
      this.readGlobal(configLines(parts[0]))
      this.readBeats(configLines(parts[1]))
    }
    if (parts.length >= 3) this.readInstruments(configLines(parts[2]))
    if (parts.length >= 4) this.readEffects(configLines(parts[3]))
    this.dispatch('NewText', this.model)
  },
  readGlobal: function (lines) {
    var conf = readConfig(lines)
    if (conf.bpm) this.bpm(conf.bpm)
    if (conf.name) this.songName(conf.name)
    if (conf.version) this.version(conf.version)
  },
  readBeats: function (lines) {
    var patternLpb
    var patternBars
    var instrument
    var line
    var patterns = this.model.patterns = {}
    var patternIndex = 0
    for (var i = 0; i < lines.length; i += 1) {
      line = lines[i]
      var idx = line.indexOf(':')
      if (idx < 0) throw new Error('Bad pattern format on line ' + i)
      instrument = line.slice(0, idx).trim()
      this.patternInstruments[instrument] = {}
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
            if (k - lastLpb - 1 !== tpb) {
              // TODO Better check here
              console.warn(new Error('Bad tpb ' + lastLpb + ' ' + k))
            }
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
          this.patternInstruments[instrument][ch] = patternIndex
        }
      }
      patternIndex += 1
      beats += 1
      patternLpb = tpb
      patternBars = beats
    }
    this.model.tpb = patternLpb
    this.model.beats = patternBars
  },
  readInstruments: function (lines) {
    var instruments = readConfig(lines)

    console.warn('instruments', instruments)

    var ins = this.model.instruments = {}
    Object.keys(this.patternInstruments).forEach(function (name, i) {
      var obj = {
        name: name
      }
      if (!instruments[name]) {
        console.warn(new Error('Undefined instrument used: ' + name))
        return
      }
      for (var k in instruments[name]) {
        obj[k] = instruments[name][k]
      }
      ins[i] = obj
    })
  },
  readEffects: function () {
  },
  // Load a beat including samples
  loadBeatUrl: function (url, cb) {
    var self = this
    this.loadBeatText(url, function (err) {
      if (err) return cb(err)
      self.loadBeatSamples(function (err, model) {
        if (err) return cb(err)
        self.position(0)
        cb(null, model)
      })
    })
  },
  // Load a beat text
  loadBeatText: function (url, cb) {
    var self = this
    xhr({
      url: url
    }, function (err, data) {
      if (err) return cb(err)
      self.readBeatText(data)
      cb(null, self)
    })
  },
  // Load the samples referenced
  loadBeatSamples: function (cb) {
    var instruments = this.model.instruments
    var ikeys = Object.keys(instruments)
    var self = this
    var count = 0
    // TODO Share the audio context
    if (!this.audioContext) this.audioContext = new (AudioContext || webkitAudioContext)()
    var context = this.audioContext
    function loadOne (i) {
      xhr({
        url: instruments[i + ''].url,
        responseType: 'arraybuffer'
      }, function (err, result) {
        if (err) return cb(err)
        context.decodeAudioData(result, function (buffer) {
          instruments[i].buffer = buffer
          instruments[i].number = i + ''
          count += 1
          if (count === ikeys.length) {
            self.dispatch('LoadedSamples', instruments)
            return cb(null, self)
          }
        })
      })
    }
    for (var i = 0; i < ikeys.length; i += 1) loadOne(ikeys[i])
    // TODO: mixin and effects
  },
  view: function (name, values) {
    var val = extend({}, bp.model.view[name] || {}, values)
    if (!values) return val
    bp.model.view[name] = val
  },
  // TODO Return a text string representing the pattern
  getPattern: function () {

  },
  // ## Modifying the model with getters and setters
  position: function (pos) {
    if (typeof pos === 'number') this.model.position = pos
    return this.model.position
  },
  instrument: function (number) {
    number = number || this.model.selectedInstrument
    var i1 = this.model.instruments[number]
    if (!i1) {
      i1 = extend({}, BeatModel.defaultInstrument, {number: number})
      this.model.instruments[number] = i1
    }
    return i1
  },
  instruments: function (changeUrls) {
    if (!changeUrls) {
      // TODO This is a bit strange
      var inst = this.model.instruments
      var keys = Object.keys(inst)
      var result = []
      for (var i = 0; i < keys.length; i += 1) {
        var i1 = inst[keys[i]]
        result.push(extend({number: keys[i]}, i1))
      }
      return result
    }
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
  note: function (pos, value) {
    // TODO Also change tracks here so live record is emabled
    if (typeof pos === 'string') pos = parseNotePos(pos)
    var ps = this.model.patterns
    if (type(value) === 'undefined') return ps[pos[1]][pos[0]]
    if (!value || value === '.') delete ps[pos[1]][pos[0]]
    else ps[pos[1]][pos[0]] = value
    return ps[pos[1]][pos[0]]
  },
  selectedInstrument: function (number) {
    if (!number) return this.model.selectedInstrument
    number += ''
    this.model.selectedInstrument = number
    this.dispatch('SelectInstrument', number)
  },
  selectedInstrumentRange: function (range) {
    var i1 = this.selectedInstrument()
    this.model.instruments[i1] = extend({},
      this.model.instruments[i1] || BeatModel.defaultInstrument,
      {
        number: i1,
        range: range})
    this.dispatch('SelectInstrumentRange', range)
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
  },
  songName: function (name) {
    if (name) this.model.songName = name
    return this.model.songName
  },
  version: function (ver) {
    if (ver) this.model.version = ver
    return this.model.version
  },
  playing: function (val) {
    if (typeof val !== 'boolean') return this.model.playing
    else this.model.playing = val
    return this.model.playing
  }
}

function toInt (n) {
  return parseInt(n, 10)
}

function parseNotePos (str) {
  var numbers = str.split(/[,;:]/)
  if (numbers.length !== 2) throw new Error('NOt a legal note pos ' + str)
  return numbers.map(toInt)
}

function configLines (text) {
  return text.split(/\n|\r\n/gm).filter(function (line) {
    return !/^\s*$|^\s*#/.test(line)
  })
}

function readConfig (lines) {
  if (typeof lines === 'string') lines = configLines(lines)
  var configs = {}
  var config
  var m
  for (var i = 0; i < lines.length; i += 1) {
    var line = lines[i]

    // config name
    m = /^(\w+[\w\s]+):(.*)$/.exec(line)
    if (m) {
      config = m[1].trim()
      configs[config] = {}
      if (m[2]) configs[config] = m[2].trim()
      continue
    }

    // config properties
    m = /^\s+([\w]+):(.*)/.exec(line)
    if (m) {
      if (!config) {
        throw new Error('Expected an config name at line ' + i + 1)
      }
      if (typeof configs[config] === 'string') {
        throw new Error('Cannot add configs to ' + config)
      }
      configs[config][m[1]] = m[2].trim()
    }
  }
  return configs
}

mixinGetSet(BeatModel, 'bpm', 100)
mixinGetSet(BeatModel, 'tpb', 4)
mixinGetSet(BeatModel, 'beats', 4)

// TODO create bp.model elsewhere
bp.model = new BeatModel()

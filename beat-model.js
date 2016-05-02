// # BeatModel
//
// Holds all data of the current beat and is referenceds from all Views and
// the BeatAudio player.
function BeatModel (text) {
  this.model = {}
  if (typeof text === 'string') this.readBeatText(text)
}

BeatModel.prototype = {
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
  },
  // TODO Return a text string representing the pattern
  getPattern: function () {

  },
  instruments: function (newInstruments) {
    if (!newInstruments) return this.model.instruments
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
  instrumentUrl: function (i, newUrl) {
    if (!newUrl) return this.model.instruments[i]
    this.model.instruments[i].url = newUrl
  },
  instrumentName: function (i, newName) {
    if (!newName) return this.model.instruments[i].name
    this.model.instruments[i].name = newName
  }
}

function mixinGetSet (AClass, prop, defaultValue) {
  AClass.prototype[prop] = function (value) {
    if (typeof value !== 'undefined') this.model[prop] = value
    if (typeof this.model[prop] === 'undefined') this.model[prop] = defaultValue
    return this.model[prop]
  }
}

mixinGetSet(BeatModel, 'bpm', 100)
mixinGetSet(BeatModel, 'tpb',   4)
mixinGetSet(BeatModel, 'beats', 4)

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


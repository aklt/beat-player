
// The underlying model of the beat
function BeatModel (o) {
  this.model = o || {}
}

BeatModel.prototype = {
  // Read a text pattern without instruments
  readPattern: function (text) {
    var pat = this.model.pattern = {}
    var inst = this.model.instruments = {}
    var lines = text.split(/\n/)
    var patternLpb
    var patternBars
    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i]
      if (/^\s*$/.test(line)) continue
      var idx = line.indexOf(':')
      if (idx < 0) throw new Error('Bad pattern format on line ' + i)
      var instrument = line.slice(0, idx).trim()
      inst[instrument] = {}
      line = line.slice(idx + 1).trim()
      var chars = line.split('')
      pat[i] = {}
      var tpb = -1
      var bars = 0
      var lastLpb = -1
      for (var k = 0; k < chars.length; k += 1) {
        var ch = chars[k]
        if (ch === ' ') {
          bars += 1
          if (tpb === -1) {
            tpb = k
            lastLpb = k
          } else {
            if (k - lastLpb - 1 !== tpb) throw new Error('Bad tpb ' + lastLpb + ' ' + k)
          }
          continue
        }
        if (ch !== '.') {
          pat[i][k] = ch
          inst[instrument][ch] = i
        }
      }
      bars += 1
      patternLpb = tpb
      patternBars = bars
    }
    this.model.tpb = patternLpb
    this.model.bars = patternBars
  },
  // TODO Return a text string representing the pattern
  getPattern: function () {

  }
}

function mixinGetSet (AClass, prop) {
  AClass.prototype[prop] = function (value) {
    if (typeof value !== 'undefined') this.model[prop] = value
    else return this.model[prop]
  }
}

mixinGetSet(BeatModel, 'bpm')
mixinGetSet(BeatModel, 'tpb')
mixinGetSet(BeatModel, 'bar')

var beat1 = `
Bas Drum: b... b... b...
Snare:    ..s. ..s. .s.s
Hihat:    x.x. x.x. .x.x
`

var b1 = new BeatModel()

b1.readPattern(beat1)

console.warn(JSON.stringify(b1, 0, 2))


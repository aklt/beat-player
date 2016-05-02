/*global ab, AudioContext, webkitAudioContext*/

// # BeatAudio
//
// Load and play patterns and instruments
//
// See: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
//
function BeatAudio (model) {
  this.model = model
  this.instruments = model.instruments()
  this.context = new (AudioContext || webkitAudioContext)()
  this.volume = this.context.createGain()
  this.volume.gain.value = 1
  this.volume.connect(this.context.destination)
  this.playing = []
  this.lookaheadTime = 100
  this.position = 0
}

BeatAudio.prototype = {
  // Load instruments
  loadSamples: function (cb) {
    var ikeys = Object.keys(this.instruments)
    var self = this
    var count = 0
    function loadOne (i) {
      ab.xhr({
        url: self.instruments[i + ''].url,
        responseType: 'arraybuffer'
      }, function (err, result) {
        if (err) return cb(err)
        self.context.decodeAudioData(result, function (buffer) {
          self.instruments[i].buffer = buffer
          count += 1
          if (count === ikeys.length) return cb(self.instruments)
        })
      })
    }
    for (var i = 0; i < ikeys.length; i += 1) {
      loadOne(i)
    }
    // TODO: mixin and effects
  },
  // Schedule offset times of samples according to pattern
  calculateTimeOffsets: function () {
    var patterns = this.model.patterns()
    this.secondsPerTick = (this.model.bpm() / 60) /
                         (this.model.tpb() * this.model.bars())
    this.scheduled = []
    for (var instrumentNumber in patterns) {
      var notes = patterns[instrumentNumber]
      for (var offset in notes) {
        var key = notes[offset]
        this.scheduled.push({
          time: this.secondsPerTick * parseInt(offset, 10),
          instrument: instrumentNumber,
          key: key
        })
      }
    }
    this.scheduled.sort(function (a, b) {
      return a.time - b.time
    })
  },
  // Start playback at pattern position
  play: function () {
    var time = this.context.currentTime
    var positionStartTime = this.position * this.secondsPerTick
    var positionEndTime = positionStartTime + this.lookaheadTime
    var playThese = []
    for (var i = 0; i < this.scheduled.length; i += 1) {
      var note = this.scheduled[i]
      if (note.time )
    }
    var self = this
    this.timeout = setTimeout(function () {
    }, this.lookaheadTime)
  },
  // Stop all playing samples
  stop: function () {
    clearTimeout(this.timeout)
    for (var i = 0; i < this.playing.length; i += 1) {
      this.playing[i].stop()
    }
    this.playing = []
  },
  // Play a sample in `when` seconds
  playSample: function (i, when, detune) {
    when = when || 0
    detune = detune || 0
    var source = this.context.createBufferSource()
    source.buffer = this.instruments[i + ''].buffer
    source.connect(this.volume)
    // TODO Make ranges of notes
    source.detune.value = detune
    // source.playbackRate.value = 2
    source.start(this.context.currentTime + when)
    source.onended = function () {
      this.ended = true
    }
    this.playing.push(source)
  },
  // Remove sounds that have been played drom this.playing
  removeEnded: function () {
    this.playing = this.playing.filter(function (s1) {
      return !s1.ended
    })
  }

  // TODO Mixing https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
}

ab.BeatAudio = BeatAudio

// test

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
var beat1Model = new BeatModel(beat1)

ab.beat1 = new BeatAudio(beat1Model)

ab.beat1.test = function () {
  console.warn('Boob', ab.beat1)
  ab.beat1.loadSamples(function () {
    console.warn('loaded')
  })
}

setTimeout(function () {
  ab.beat1.test()
}, 200)

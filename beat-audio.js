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
  },
  // Schedule offset times of samples according to pattern
  schedule: function () {

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
  },
  // Start playback at pattern position
  start: function (position) {
    this.timeout = setTimeout(function () {

    }, 100)
  },
  // Stop all playing samples
  stop: function () {
    clearTimeout(this.timeout)
    for (var i = 0; i < this.playing.length; i += 1) {
      this.playing[i].stop()
    }
    this.playing = []
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

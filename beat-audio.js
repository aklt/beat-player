/*global ab, AudioContext, webkitAudioContext, BeatModel*/

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
  this.position = 0
  this.positionTime = 0
  this.lookaheadTime = 0.3
}

// divide notes on property `note.time` into buckets of `intervalTime` size
function timeBuckets (notes, intervalTime) {
  var time = intervalTime
  var buckets = [[]]
  var ibucket = 0
  var i = 0
  var note = notes[i]
  while (note && i < notes.length) {
    if (note.time < time) {
      buckets[ibucket].push(note)
    } else {
      ibucket += 1
      buckets[ibucket] = []
      time += intervalTime
      i -= 1
    }
    i += 1
    note = notes[i]
  }
  return buckets
}

BeatAudio.prototype = {
  // load and reset variables
  load: function (cb) {
    var self = this
    this.loadSamples(function () {
      self.calculateNoteBuckets()
      if (typeof cb === 'function') cb(null, self)
    })
  },
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
          if (count === ikeys.length) return cb(null, self.instruments)
        })
      })
    }
    for (var i = 0; i < ikeys.length; i += 1) loadOne(i)
    // TODO: mixin and effects
  },
  // Schedule offset times of samples according to pattern
  calculateNoteBuckets: function () {
    var patterns = this.model.patterns()
    this.secondsPerTick = (this.model.bpm() / 60) /
                         (this.model.tpb() * this.model.beats())
    this.orderedNotes = []
    for (var instrumentNumber in patterns) {
      var notes = patterns[instrumentNumber]
      for (var offset in notes) {
        var key = notes[offset]
        this.orderedNotes.push({
          time: this.secondsPerTick * parseInt(offset, 10),
          instrument: instrumentNumber,
          key: key
        })
      }
    }
    this.orderedNotes.sort(function (a, b) {
      return a.time - b.time
    })

    this.noteBuckets = timeBuckets(this.orderedNotes, this.lookaheadTime)
    this.noteBucketsIndex = 0
    console.warn('buckets', this.noteBuckets)
  },
  // Start playback at pattern position
  tick: function (currentTime) {
    var self = this
    var time = this.context.currentTime
    this.timeout = setInterval(function () {
      var delta = self.context.currentTime - time
      console.warn(time, delta)
      time += self.secondsPerTick
      console.warn('time', time, delta, self.secondsPerTick, self.context.currentTime)
    }, this.lookaheadTime * 1000)
  },
  play: function () {
    this.tick()
  },
  // Stop all playing samples
  stop: function () {
    clearTimeout(this.timeout)
  },
  // Play a sample in `when` seconds
  playSample: function (i, when, detune) {
    when = when || 0
    detune = detune || 0
    var source = this.context.createBufferSource()
    var instrument = this.instruments[i + '']
    if (!instrument) throw new Error('Please init')
    source.buffer = instrument.buffer
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
HiHat:     x.x. x.x. x.x.
Bass Drum: b... .... b...
Snare:     .... s... ..s.
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
  ab.beat1.load(function (err) {
    if (err) throw err
    console.warn('loaded')
    ab.beat1.model.bpm(80)
    ab.beat1.play()
    setTimeout(function (o) {
      ab.beat1.stop()
    }, 3000)
  })
}

setTimeout(function () {
  ab.beat1.test()
}, 200)

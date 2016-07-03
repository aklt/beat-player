/*global bp, AudioContext, webkitAudioContext, BeatModel*/

// # BeatAudio
//
// Load and play patterns and instruments
//
// See: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
//
function BeatAudio (model) {
  this.model = model
  // TODO There is a max. limit on the number of AudioContexts
  this.context = new (AudioContext || webkitAudioContext)()
  this.volume = this.context.createGain()
  this.volume.gain.value = 1
  this.volume.connect(this.context.destination)
  this.playing = []
  this.position = 0
  this.positionTime = 0
  this.lookaheadTime = 0.4
}

// divide notes on property `note.time` into buckets of `intervalTime` size
// TODO deprecate and use setTimeout with intervals
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
  load: function (url, cb) {
    var self = this
    this.model.load(url, function (err, model) {
      if (err) return cb(err)
      self.calculateNoteBuckets()
      if (typeof cb === 'function') cb(null, self)
    })
  },
  // Schedule offset times of samples according to pattern
  calculateNoteBuckets: function () {
    var patterns = this.model.patterns()
    this.secondsPerTick = (60 / this.model.bpm()) / this.model.tpb()
    console.warn('bpm, secondsPerTick', this.model.bpm(), this.secondsPerTick)
    this.orderedNotes = []
    for (var instrumentNumber in patterns) {
      var notes = patterns[instrumentNumber]
      for (var offset in notes) {
        var key = notes[offset]
        this.orderedNotes.push({
          time: this.secondsPerTick * parseInt(offset, 10),
          instrument: instrumentNumber,
          key: key,
          pos: offset
        })
      }
    }
    this.orderedNotes.sort(function (a, b) { return a.time - b.time })
    this.noteBuckets = timeBuckets(this.orderedNotes, this.lookaheadTime)
    this.noteBucketsIndex = 0
  },
  // Start playback at pattern position
  play: function () {
    if (!this.timeout) {
      this.calculateNoteBuckets()
      var self = this
      var ctx = this.context
      var time0 = ctx.currentTime
      var bucketIndex = this.noteBucketsIndex
      var length = this.noteBuckets.length
      var deltaTime = 0
      this.timeout = setInterval(function () {
        var timePassed = ctx.currentTime - time0
        var bucketTime = bucketIndex * self.lookaheadTime
        deltaTime = bucketTime - timePassed
        var bucket = self.noteBuckets[bucketIndex]
        for (var i = 0; i < bucket.length; i += 1) {
          var note = bucket[i]
          var xTime = self.lookaheadTime + note.time - bucketTime + deltaTime
          self.playSample(note.instrument, xTime)
      // self.model.dispatch('step', note.pos)
        }
        bucketIndex += 1
        if (bucketIndex === length) {
          bucketIndex = 0
          time0 += timePassed
        }
      }, this.lookaheadTime * 1000)
    }
  },
  // Stop all playing samples
  stop: function () {
    clearTimeout(this.timeout)
    this.timeout = null
  },
  // Play a sample in `when` seconds
  playSample: function (i, when) {
    when = when || 0
    // detune = detune || 0
    var source = this.context.createBufferSource()
    var instrument = this.model.instruments()[i]
    if (!instrument) throw new Error('Please init')
    source.buffer = instrument.buffer
    source.connect(this.volume)
    // TODO Make ranges of notes
    // source.detune.value = detune
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

bp.BeatAudio = BeatAudio

bp.testBeatAudio = function () {
  var beat1Model = bp.model || new BeatModel(beat1)
  var beat1 = bp.beat1 = new BeatAudio(beat1Model)
  beat1.model.bpm(110)
  beat1.calculateNoteBuckets()
  beat1.play()
  setTimeout(function (o) {
    beat1.stop()
  }, 3000)
}

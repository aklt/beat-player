/*global bp, AudioContext */

// TODO Define AudioContext

// # BeatAudio
//
// Load and play patterns and instruments
//
// See: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
//
function BeatAudio (model) {
  this.model = model
  // TODO There is a max. limit on the number of AudioContexts
  this.context = new AudioContext()
  this.volume = this.context.createGain()
  this.volume.gain.value = 1
  this.volume.connect(this.context.destination)
  this.playing = []
  this.position = 0
  this.lookaheadTime = 0.4
}

BeatAudio.prototype = {
  loadUrl: function (url, cb) {
    var self = this
    this.model.loadBeatUrl(url, function (err, model) {
      if (err) return cb(err)
      if (typeof cb === 'function') cb(null, self)
    })
  },
  calcTickTimes: function () {
    var patterns = this.model.patterns()
    var bpm = this.model.bpm()
    var tpb = this.model.tpb()
    var secondsPerTick = 60 / (bpm * tpb)
    var length = this.model.patternLength()
    var ordered = new Array(length)

    for (var tick = 0; tick < length; tick += 1) {
      var notes = []
      for (var instrumentIndex in patterns) {
        var instrumentLine = patterns[instrumentIndex]
        if (instrumentLine[tick]) {
          notes.push({
            inst: instrumentIndex,
            note: instrumentLine[tick]
          })
        }
      }
      if (notes.length > 0) {
        ordered[tick] = notes
      }
    }

    this.patternLength = length
    this.orderedNotes = ordered
    this.secondsPerTick = secondsPerTick
  },
  play: function () {
    if (!this.timeout) {
      this.calcTickTimes()
      // TODO Trigger timeout just before event
      this.nextTick = this.context.currentTime + Math.max(this.secondsPerTick / 10, 0.05)
      this._play()
    }
  },
  _play: function () {
    var playThese = this.orderedNotes[this.position] || []
    var delta = this.nextTick - this.context.currentTime
    // TODO scale this according to drift
    // TODO live recording, changing bpm
    var timeoutTime = this.secondsPerTick * 1000
    var self = this

    this.model.dispatch('GotoPos', this.position)
    for (var i = 0; i < playThese.length; i += 1) {
      this.playSample(playThese[i].inst, this.context.currentTime + delta)
    }
    this.timeout = setTimeout(function () {
      self.position += 1
      self.nextTick += self.secondsPerTick
      if (self.position === self.patternLength) {
        self.position = 0
      }
      self._play()
    }, timeoutTime)
  },
  // Stop all playing samples
  stop: function () {
    clearTimeout(this.timeout)
    this.timeout = null
    this.model.dispatch('GotoPos', this.position)
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
    source.start(when)
    // source.onended = function () {
    //   console.warn('ended')
    // }
  }
  // TODO Mixing https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
}
bp.BeatAudio = BeatAudio

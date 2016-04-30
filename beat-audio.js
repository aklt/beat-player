/*global ab, AudioContext, webkitAudioContext*/
// Schedule audio for playback
function BeatAudio (o) {
  this.instruments = o
  this.context = new (AudioContext || webkitAudioContext)()
  this.volume = this.context.createGain()
  this.volume.gain.value = 1
  this.volume.connect(this.context.destination)
  this.playing = []
}

BeatAudio.prototype = {
  load: function (cb) {
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
    for (var i = 1; i <= ikeys.length; i += 1) {
      loadOne(i)
    }
  },
  playSample: function (i, when) {
    when = when || 0
    var source = this.context.createBufferSource()
    source.buffer = this.instruments[i + ''].buffer
    source.connect(this.volume)
    source.start(this.context.currentTime + when)
    source.onended = function () {
      this.ended = true
    }
    this.playing.push(source)
  },
  removeEnded: function () {
    this.playing = this.playing.filter(function (s1) {
      return !s1.ended
    })
  },
  stopAll: function () {
    for (var i = 0; i < this.playing.length; i += 1) {
      this.playing[i].stop()
    }
    this.playing = []
  },
  start: function (position) {
    this.timeout = setTimeout(function () {

    }, 100)
  },
  stop: function () {
  }

  // TODO Mixing https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
}

ab.BeatAudio = BeatAudio
ab.beat1 = new BeatAudio({
  1: {
    url: 'samples/bd.wav',
    name: 'Bass Drum',
    loop: true,
    detune: 0
  },
  2: {
    url: 'samples/sd.wav',
    name: 'Snare Drum'
  },
  3: {
    url: 'samples/hat.wav',
    name: 'Hihat'
  }
})

ab.beat1.test = function () {
  ab.beat1.load(function () {
    console.warn('loaded')
  })
}

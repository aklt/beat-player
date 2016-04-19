(function (win) {
  var bp = win.beatPlayer = {}
  bp.sounds = {
    bd: new Audio("samples/bd.wav"),
    sd: new Audio("samples/sd.wav"),
    hat: new Audio("samples/hat.wav")
  }

  var ab = abcd

  ab.ready(function () {
    console.warn('ready', bp.sounds.bd);
    console.warn('ready', bp.sounds.bd.play());
    
  })

}(window))

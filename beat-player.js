(function (win) {
  var ab = abcd
  var bp = win.beatPlayer = {}
  bp.sounds = {
    bd: new Audio("samples/bd.wav"),
    sd: new Audio("samples/sd.wav"),
    hat: new Audio("samples/hat.wav")
  }

  function ScoreColumns (el) {
    console.warn(ab.type(el));
    this.els = ab.qa('p', el).filter(function (el1) {
      return el1.childNodes.length > 1
	})
    this.selectedIndex = -1
    this.selectedEl = this.els[this.selectedIndex]
    this.lastSelectedEl = this.selectedEl
    console.warn('els', this.els);
  }

  ScoreColumns.prototype = {
    step: function (units) {
      if (!units) units = 1
      this.selectedIndex += units
      if (this.selectedIndex >= this.els.length) this.selectedIndex = 0
      this.lastSelectedEl = this.selectedEl
      this.selectedEl = this.els[this.selectedIndex]

      if (!this.selectedEl) throw new Error('BAd ' + this.selectedIndex)
      if (this.lastSelectedEl) ab.classRemove(this.lastSelectedEl, 'active')
      ab.classAdd(this.selectedEl, 'active')
    }
  }


  function Player (o) {
    this.el = ab.qs('#' + o.id)
  }

  ab.eventHandlers(Player, {
    click: function (ev, el) {
      console.warn('You clicked', ev, el);
    }
  })


  var scEl = ab.qs('.score-columns')
  var sc = new ScoreColumns(scEl)

  ab.ready(function () {
    console.warn('ready', bp.sounds.bd);
    console.warn('ready', bp.sounds.bd.play());
    console.warn('sc', sc);
    var start = Date.now()
    setInterval(function () {
      requestAnimationFrame(function () {
        sc.step()
      })
    }, 80)

    var player = new Player({id: 'player1'})
    player.eventsAttach()

  })


}(window))

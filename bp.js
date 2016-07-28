/* Beat player v0.0.1*/
;(function () {
  /*global XMLHttpRequest Node*/
  var __slice = [].slice
  var __hasProp = {}.hasOwnProperty
  var __proto = 'prototype'
  
  // ## type(elem[, isType])
  //
  // Return the type of an element
  // if isType is a string returns true if the types match
  function type (obj, isType) {
    var t
    if (obj === null) t = 'null'
    else if (obj === undefined) t = 'undefined'
    if (t) {
      if (typeof isType === 'string') return t === isType
      return t
    }
    var ret = Object.prototype.toString.call(obj).match(/^\[object\s+(.*?)\]$/)[1]
    ret = ret ? ret.toLowerCase() : ''
    if (ret === 'number' && isNaN(obj)) t = 'nan'
    else t = ret
    if (typeof isType === 'string') return t === isType
    return t
  }
  
  // ## Object extend(target, parents...)
  function extend (/* target, parents... */) {
    var args = __slice.call(arguments)
    var target = args[0]
    for (var i = 1; i < args.length; i += 1) {
      var parent = args[i]
      if (parent) {
        for (var key in parent) {
          if (__hasProp.call(parent, key)) target[key] = parent[key]
        }
      }
    }
    return target
  }
  
  function each (objOrArray, fn) {
    if (Array.isArray(objOrArray)) {
      objOrArray.forEach(function (elem, i) {
        fn(i, elem)
      })
    } else {
      var t = type(objOrArray)
      if (t === 'object') {
        for (var k in objOrArray) {
          var v = objOrArray[k]
          fn(k, v)
        }
      }
    }
  }
  
  function eachPush (objOrArray, fn) {
    var result = []
    each(objOrArray, function (k, v) {
      result.push(fn(k, v))
    })
    return result
  }
  
  // ## delay(time, fun, scope, args...)
  function delay (/* time, fun, ... */) {
    var a = __slice.call(arguments)
    setTimeout(function () {
      a[1].apply(a[2], a.slice(3))
    }, a[0])
  }
  
  function _flatten (result, args) {
    for (var i = 0; i < args.length; i += 1) {
      var el = args[i]
      if (Array.isArray(el)) {
        _flatten(result, el)
      } else {
        result.push(el)
      }
    }
    return result
  }
  
  function flatten (args) {
    return _flatten([], args)
  }
  
  // HTtml Tags
  // $t('div', {id: foo})
  // $t('div', {id: foo}, 'text')
  // $t('div', text1, [text2, ...], ...)
  function $t (/* tag, opts, text...*/) {
    var args = [].slice.call(arguments)
    var tag = args.shift()
    var opts = {}
    if (type(args[0]) === 'object') opts = args.shift()
    return '<' + tag + $t_attr(opts) + '>' +
              flatten(args).join('\n') +
           '</' + tag + '>'
  }
  
  function $ts (/* tag, opts, text... */) {
    var args = [].slice.call(arguments)
    var tag = args.shift()
    var opts = {}
    if (type(args[0]) === 'object') opts = args.shift()
    return eachPush(flatten(args), function (i, text) {
      opts.index = i
      return $t(tag, opts, text)
    })
  }
  
  function $t_attr (opts) {
    var result = []
    each(opts, function (k, v) {
      result.push(k + '="' + v + '"')
    })
    if (result.length === 0) return ''
    return ' ' + result.join(' ')
  }
  
  var __window = window
  var __document = __window.document
  
  function classAdd (el, cls) {
    if (typeof el.className === 'undefined') el.className = cls
    else el.className = el.className + ' ' + cls
    return el.className
  }
  
  function classRemove (el, cls) {
    var c = el.className
    if (!c) return
    else el.className = c.replace(new RegExp('\\s?' + cls, 'g'), '')
    return el.className
  }
  
  // From http://dpi.lv/utopia.js
  function qs (expr, con) {
    return (con || __document).querySelector(expr)
  }
  
  function qa (expr, con) {
    return __slice.call((con || __document).querySelectorAll(expr))
  }
  
  function $id (name) {
    return __document.getElementById(name)
  }
  
  var _pfx_style = __document.createElement('dummy').style
  var _pfx_prefixes = 'Webkit Moz O ms Khtml'.split(' ')
  var _pfx_memory = {}
  
  // Return b prefixed version of b browser style
  //
  // From http://bartaz.github.io/impress.js/js/impress.js
  function pfx (prop) {
    if (typeof _pfx_memory[ prop ] === 'undefined') {
      var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1)
      var props = (prop + ' ' + _pfx_prefixes.join(ucProp + ' ') +
                  ucProp).split(' ')
  
      _pfx_memory[ prop ] = null
      for (var i in props) {
        if (_pfx_style[props[i]] !== undefined) {
          _pfx_memory[prop] = props[i]
          break
        }
      }
    }
    return _pfx_memory[ prop ]
  }
  
  // Set the css specified in 'props' on element 'el'
  //
  // From http://bartaz.github.io/impress.js/js/impress.js
  //
  function css (el, props) {
    if (typeof el === 'string') el = qs(el)
    if (!el.style) return
    var key, pkey
    for (key in props) {
      if (props.hasOwnProperty(key)) {
        pkey = pfx(key)
        if (pkey !== null) {
          el.style[pkey] = props[key]
        }
      }
    }
    return el
  }
  
  function elRect (el) {
    if (!el.offsetParent) throw new Error('Need offsetParent')
    var curleft = el.offsetLeft
    var curtop = el.offsetTop
    var width = el.offsetWidth
    var height = el.offsetHeight
    while ((el = el.offsetParent)) {
      curleft += el.offsetLeft
      curtop += el.offsetTop
    }
    return {
      left: curleft,
      top: curtop,
      width: width,
      height: height
    }
  }
  
  var _readyFuncs = []
  var _loaded
  function ready (fn) {
    if (_loaded) return fn()
    _readyFuncs.push(fn)
    if (_readyFuncs.length === 1) {
      __document.addEventListener('DOMContentLoaded', function (ev) {
        for (var i = 0; i < _readyFuncs.length; i += 1) {
          _readyFuncs[i]()
        }
        _loaded = 1
      })
    }
  }
  
  // ## attr(el, Object|String)
  //
  // Get or set attributes on a node
  //
  function attr (el, attrs) {
    if (typeof attrs === 'string') {
      return el.getAttribute(attrs)
    }
    Object.keys(attrs || {}).forEach(function (at) {
      // TODO Ugly hack to create a text element in htmlEl and svgEl
      if (at === 'text') return
      el.setAttribute(at, attrs[at])
    })
  }
  
  function html (el, text) {
    el.innerHTML = text
  }
  
  // ### dom(html[, html, ...])
  // Create dom elements from html strings
  function createDomArray (o) {
    var h = __document.createElement('div')
    h.innerHTML = o.html
    return __slice.call(h.childNodes)
  }
  
  function dom (/* htmlText0, htmlText1, ..., options{css} */) {
    var args = __slice.call(arguments)
    var options = args[args.length - 1]
    if (typeof options === 'object') {
      args.pop()
    }
    var result = []
    args.forEach(function (arg) {
      var domArray = createDomArray({html: arg})
      domArray.forEach(function (dom1) {
        if (dom1) {
          if (options.css) css(dom1, options.css)
        }
      })
      result = result.concat(domArray)
    })
    return result.length === 1 ? result[0] : result
  }
  
  function removeChild (root, child) {
    return root.removeChild(child)
  }
  
  function appendChild (root, child) {
    root.appendChild(child)
    return root
  }
  
  function insertBefore(parent, newElement, beforeThis) {
    return parent.insertBefore(newElement, beforeThis)
  }
  
  function prevSibling (el) {
    return el.previousSibling
  }
  
  function nextSibling (el) {
    return el.nextSibling
  }
  
  function textEl (text) {
    return __document.createTextNode(text)
  }
  
  // ### append(root[, child || body])
  // Append dom elements
  function append (root, child) {
    if (typeof root === 'string') root = qs(root)
    if (typeof child === 'string') child = qs(child)
    if (!root) root = __document.body
    // Node types https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#Constants
    if (root.nodeType === Node.ELEMENT_NODE) {
      if (!Array.isArray(child)) child = [child]
      var i = 0
      while (i < child.length) {
        var c1 = child[i]
        if (c1 && c1.nodeType && c1.nodeType === 1) {
          root.appendChild(c1)
        }
        i += 1
      }
    }
  }
  
  function htmlEl (name, attrs) {
    var el = __document.createElement(name)
    if (attrs) {
      if (attrs.text) {
        append(el, textEl(attrs.text))
      }
      attr(el, attrs)
    }
    return el
  }
  
  // Adapted from http://www.quirksmode.org/js/events_properties.html
  function eventTarget (e) {
    e = e || __window.event
    var targ = e.target || e.srcElement
    if (targ.nodeType === 3) { // defeat Safari bug
      targ = targ.parentNode
    }
    return targ
  }
  
  function addEvents (el, events, handlerContext, capture) {
    // console.warn('addEvents', el, events, handlerContext)
    for (var i = 0; i < events.length; i += 1) {
      el.addEventListener(events[i], handlerContext, capture)
    }
  }
  
  function removeEvents (el, events, handlerContext, capture) {
    for (var i = 0; i < events.length; i += 1) {
      el.removeEventListener(events[i], handlerContext, capture)
    }
  }
  
  // ## mixinHandlers(AClass, events, capture)
  //
  // Implement the eventhandler interface on an object
  //
  // Calling this function on a class causes it to implement
  //
  //     handleEvent  - to call on<eventName>
  //     eventsAttach - to attach event handlers to this.target
  //     eventsDetach - remove event handlers
  //
  // @param {Object} AClass The object to attach to
  // @param {Object} events The events to handle
  // @param {Boolean} capture Should we capture events?
  //
  function mixinHandlers (AClass, events, capture) {
    AClass[__proto].handleEvent = function (ev) {
      console.warn('handleEvent', this)
      var target = eventTarget(ev)
      if (this.ondefaultHandler) {
        this.ondefaultHandler(ev, target)
      }
      var fn = this['on' + ev.type]
      if (fn) return fn.call(this, ev, target)
    }
    var evs = Object.keys(events)
    for (var i = 0; i < evs.length; i += 1) {
      var ev = evs[i]
      AClass[__proto]['on' + ev] = events[ev]
    }
    AClass[__proto].eventsAttach = function () {
      if (!this.parentEl) throw new Error('Need this.parentEl to be a DOM element')
      addEvents(this.parentEl, evs, this, capture)
    }
    AClass[__proto].eventsDetach = function () {
      removeEvents(this.parentEl, evs, this, capture)
    }
  }
  
  // ## mixinDom(DefinedClassName)
  //
  // Mixin function
  //
  //   * Class.create(): To create an instance of the class setting this.el to be
  //     the dom element
  //
  // and prototype methods
  //
  //   * render(templateOpts): Render templates to non attached DOM in this.dom.
  //     Calls this.afterRender()
  //   * attach(el): Attach to an element.  Calls this.eventsAttach() and
  //     this.afterAttach()
  //   * detach(): Detach.  Calls this.beforeDetach() and this.eventsDetach()
  //
  // The constructor should define the parent to which this element will be
  // attached.
  //
  function mixinDom (AClass) {
    var origCreate = AClass.create
    AClass.create = function (o) {
      var a1
      // Run previously defined AClass.create functions to get an instance
      if (typeof origCreate === 'function') a1 = origCreate(o)
      else a1 = new AClass(o)
      o = o || {}
      a1 = extend(a1, o)
      return a1
    }
    AClass[__proto].render = function (o) {
      var h = __document.createElement('div')
      var f = __document.createDocumentFragment()
      var i
      o = o || {}
      this.values = extend({}, this.values, o)
      h.innerHTML = this.tpl(this.values)
      // Count of the number of children that the dom fragment contains
      this.domCount = 0
      while ((i = h.firstChild)) {
        f.appendChild(i)
        this.domCount += 1
      }
      // XXX Check
      if (this.domCount === 0) throw new Error('this.domCount is 0')
      this.dom = f
      if (typeof this.afterRender === 'function') this.afterRender()
      return this
    }
    AClass[__proto].attach = function (parent) {
      if (!parent) parent = this.parentEl
      parent = (typeof parent === 'string') ? qs(parent) : parent
      if (!parent) throw new Error('No such parent el: ' + parent)
      if (this.domCount === 0) this.render()
      if (this.dom) {
        parent.appendChild(this.dom)
      }
      this.parentEl = parent
      if (typeof this.eventsAttach === 'function') this.eventsAttach()
      if (typeof this.afterAttach === 'function') this.afterAttach()
      return this
    }
    AClass[__proto].detach = function () {
      if (typeof this.beforeDetach === 'function') this.beforeDetach()
      if (typeof this.eventsDetach === 'function') this.eventsDetach()
      while (this.domCount > 0) {
        removeChild(this.parentEl, this.parentEl.lastChild)
        this.domCount -= 1
      }
    }
    // TODO
    AClass[__proto].update = function (o) {
      this.detach()
      this.renderModel()
      this.attach()
    }
  }
  
  function mixinHideShow (AClass) {
    AClass[__proto].hide = function () {
      classAdd(this.parentEl, 'hidden')
    }
    AClass[__proto].show = function () {
      classRemove(this.parentEl, 'hidden')
    }
  }
  
  // TODO setRequestHeader
  function xhr (o, cb) {
    var xhr1 = new XMLHttpRequest()
    var method = o.method || 'GET'
    xhr1.open(method, o.url)
    xhr1.onreadystatechange = function () {
      if (xhr1.readyState === 4) {
        if (xhr1.status < 300) {
          cb(null, xhr1.response)
        } else {
          cb(xhr1.status + ' ' + xhr1.statusText)
        }
      }
    }
    for (var prop in o) {
      if (prop === 'url' || prop === 'method' || prop === 'data') continue
      xhr1[prop] = o[prop]
    }
    xhr1.send(o.data)
  }
  
  function mixinGetSet (AClass, prop, defaultValue) {
    AClass.prototype[prop] = function (value) {
      var change
      if (typeof value !== 'undefined') {
        this.model[prop] = parseInt(value, 10)
        change = true
      }
      if (typeof this.model[prop] === 'undefined') {
        this.model[prop] = defaultValue
        change = true
      }
      if (change) {
        var cb = this.subscriptions['Change' + ucFirst(prop)]
        if (typeof cb === 'function') cb()
      }
      return this.model[prop]
    }
  }
  
  function IterElems (els, i) {
    this.elems = els
    this.index = i || 0
  }
  
  IterElems.prototype = {
    next: function () {
      this.index += 1
      if (this.index === this.elems.length) this.index = 0
      return this.elems[this.index]
    },
    prev: function () {
      this.index -= 1
      if (this.index === -1) this.index = this.elems.length - 1
      return this.elems[this.index]
    },
    step: function (s) {
      if (s > 0) return this.next()
      return this.prev()
    },
    get: function () {
      return this.elems[this.index]
    },
    set: function (pos) {
      this.index = pos
      return this.elems[this.index]
    }
  }
  
  function mixinFocus (context, obj, elName, className) {
    obj.focus = function () {
      if (!obj[elName]) throw new Error('Need obj[' + elName + ']')
      if (context.lastEl) classRemove(context.lastEl, className)
      classAdd(obj[elName], className)
      context.lastEl = obj[elName]
    }
  }
  
  function createView (bp, AClass, proto, handlers, args) {
    if (!bp.model) throw new Error('Need bp.model')
    if (!bp.live) throw new Error('Need bp.live')
    if (!AClass.mixedIn) {
      if (!proto.tpl) throw new Error('Need proto.tpl function for markup')
      if (!proto.renderModel) throw new Error('Need proto.renderModel')
      if (!proto.handleKey) {
        console.warn('installing default handleKey for', AClass.name)
        proto.handleKey = function () {
          console.warn('No handling')
          return false
        }
      }
      AClass.prototype = proto
      // TODO move elsewhere
      AClass.prototype.emit = function (ev, arg) {
        this.model.dispatch(ev, arg)
      }
      mixinDom(AClass)
      mixinHandlers(AClass, handlers)
      AClass.mixedIn = true
    }
    args = args || {}
    if (!args.id) throw new Error('Need args.id')
    args.model = bp.model
    args.parentEl = $id(args.id)
    var obj = AClass.create(args)
    mixinFocus(bp.focus, obj, 'parentEl', 'focus')
    bp.live[args.id] = obj
  }
  
  function lcFirst (text) {
    return text[0].toLowerCase() + text.slice(1)
  }
  
  function ucFirst (text) {
    return text[0].toUpperCase() + text.slice(1)
  }
  /*global __window extend xhr AudioContext webkitAudioContext mixinGetSet type*/
  // # BeatModel
  //
  // Represents the model of the current beat.
  //
  // Holds all data of the current beat and is referenced from all Views.
  //
  // TODO Principle: modify tghe model first and then the view on basis of model
  // values. In
  
  // TODO Don't expose bp.live
  var bp = __window.bp = {
    live: {},
    test: {},
    focus: {}
  }
  
  function BeatModel (o) {
    o = o || {}
    this.model = {
      instruments: []
    }
    this.patternInstruments = {}
    this.subscriptions = {}
    this.model = extend({}, this.model, o)
    if (typeof o.text === 'string') this.readBeatText(o.text)
  }
  
  BeatModel.defaultInstrument = {
    name: 'Unknown Instrument',
    url: 'Unknown URL',
    range: null
  }
  
  var subscriptionEvents = {
    NewText: 1,
    ChangeBpm: 1,
    ChangeTpb: 1,
    ChangeBeats: 1,
    ChangeNote: 1,
    GotoPos: 1,
    SelectInstrument: 1,
    SelectInstrumentRange: 1,
    LoadedSamples: 1,
    play: 1,
    pause: 1,
    stop: 1,
    forward: 1,
    back: 1,
    step: 1,
    playerStep: 1
  }
  
  BeatModel.prototype = {
    subscribe: function (ev, cb, context) {
      if (!subscriptionEvents[ev]) throw new Error('Illegal event name ' + ev)
      if (!this.subscriptions[ev]) this.subscriptions[ev] = []
      if (!context) context = this
      this.subscriptions[ev].push([cb, context])
    },
    dispatch: function (ev, data) {
      if (!subscriptionEvents[ev]) throw new Error('Illegal subscription event name ' + ev)
      var cbs = this.subscriptions[ev] || []
      console.warn('dispatch', ev, data)
      if (!cbs.disabled) {
        for (var i = 0; i < cbs.length; i += 1) {
          var cb = cbs[i]
          console.warn('  call', cb[0].name, data)
          cb[0].call(cb[1], data)
        }
      }
    },
    enable: function (evName) {
      var o = this.subscriptions[evName]
      if (!o) throw new Error('Need model.subscriptions[' + evName + ']')
      o.disabled = false
    },
    disable: function (evName) {
      var o = this.subscriptions[evName]
      if (!o) throw new Error('Need model.subscriptions[' + evName + ']')
      o.disabled = true
    },
    // Read a text pattern without instruments
    // TODO Move reading to a different file
    readBeatText: function (text) {
      var parts = text.split(/^--.*/m)
      if (parts.length < 2) throw new Error('Need at least global anmd beat parts')
      if (parts.length >= 2) {
        this.readGlobal(configLines(parts[0]))
        this.readBeats(configLines(parts[1]))
      }
      if (parts.length >= 3) this.readInstruments(configLines(parts[2]))
      if (parts.length >= 4) this.readEffects(configLines(parts[3]))
      this.dispatch('NewText', this.model)
    },
    readGlobal: function (lines) {
      var conf = readConfig(lines)
      if (conf.bpm) this.bpm(conf.bpm)
      if (conf.name) this.songName(conf.name)
      if (conf.version) this.version(conf.version)
    },
    readBeats: function (lines) {
      var patternLpb
      var patternBars
      var instrument
      var line
      var patterns = this.model.patterns = {}
      var patternIndex = 0
      for (var i = 0; i < lines.length; i += 1) {
        line = lines[i]
        var idx = line.indexOf(':')
        if (idx < 0) throw new Error('Bad pattern format on line ' + i)
        instrument = line.slice(0, idx).trim()
        this.patternInstruments[instrument] = {}
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
              if (k - lastLpb - 1 !== tpb) {
                // TODO Better check here
                console.warn(new Error('Bad tpb ' + lastLpb + ' ' + k))
              }
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
            this.patternInstruments[instrument][ch] = patternIndex
          }
        }
        patternIndex += 1
        beats += 1
        patternLpb = tpb
        patternBars = beats
      }
      this.model.tpb = patternLpb
      this.model.beats = patternBars
    },
    readInstruments: function (lines) {
      var instruments = readConfig(lines)
  
      console.warn('instruments', instruments)
  
      var ins = this.model.instruments = {}
      Object.keys(this.patternInstruments).forEach(function (name, i) {
        var obj = {
          name: name
        }
        if (!instruments[name]) {
          console.warn(new Error('Undefined instrument used: ' + name))
          return
        }
        for (var k in instruments[name]) {
          obj[k] = instruments[name][k]
        }
        ins[i] = obj
      })
    },
    readEffects: function () {
    },
    // Load a beat including samples
    loadBeatUrl: function (url, cb) {
      var self = this
      this.loadBeatText(url, function (err) {
        if (err) return cb(err)
        self.loadBeatSamples(function (err, model) {
          if (err) return cb(err)
          self.position(0)
          cb(null, model)
        })
      })
    },
    // Load a beat text
    loadBeatText: function (url, cb) {
      var self = this
      xhr({
        url: url
      }, function (err, data) {
        if (err) return cb(err)
        self.readBeatText(data)
        cb(null, self)
      })
    },
    // Load the samples referenced
    loadBeatSamples: function (cb) {
      var instruments = this.model.instruments
      var ikeys = Object.keys(instruments)
      var self = this
      var count = 0
      // TODO Share the audio context
      if (!this.audioContext) this.audioContext = new (AudioContext || webkitAudioContext)()
      var context = this.audioContext
      function loadOne (i) {
        xhr({
          url: instruments[i + ''].url,
          responseType: 'arraybuffer'
        }, function (err, result) {
          if (err) return cb(err)
          context.decodeAudioData(result, function (buffer) {
            instruments[i].buffer = buffer
            instruments[i].number = i + ''
            count += 1
            if (count === ikeys.length) {
              self.dispatch('LoadedSamples', instruments)
              return cb(null, self)
            }
          })
        })
      }
      for (var i = 0; i < ikeys.length; i += 1) loadOne(ikeys[i])
      // TODO: mixin and effects
    },
    view: function (name, values) {
      var val = extend({}, bp.model.view[name] || {}, values)
      if (!values) return val
      bp.model.view[name] = val
    },
    // TODO Return a text string representing the pattern
    getPattern: function () {
  
    },
    // ## Modifying the model with getters and setters
    position: function (pos) {
      if (typeof pos === 'number') this.model.position = pos
      return this.model.position
    },
    instrument: function (number) {
      number = number || this.model.selectedInstrument
      var i1 = this.model.instruments[number]
      if (!i1) {
        i1 = extend({}, BeatModel.defaultInstrument, {number: number})
        this.model.instruments[number] = i1
      }
      return i1
    },
    instruments: function (changeUrls) {
      if (!changeUrls) {
        // TODO This is a bit strange
        var inst = this.model.instruments
        var keys = Object.keys(inst)
        var result = []
        for (var i = 0; i < keys.length; i += 1) {
          var i1 = inst[keys[i]]
          result.push(extend({number: keys[i]}, i1))
        }
        return result
      }
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
    note: function (pos, value) {
      // TODO Also change tracks here so live record is emabled
      if (typeof pos === 'string') pos = parseNotePos(pos)
      var ps = this.model.patterns
      if (type(value) === 'undefined') return ps[pos[1]][pos[0]]
      if (!value || value === '.') delete ps[pos[1]][pos[0]]
      else ps[pos[1]][pos[0]] = value
      return ps[pos[1]][pos[0]]
    },
    selectedInstrument: function (number) {
      if (!number) return this.model.selectedInstrument
      number += ''
      this.model.selectedInstrument = number
      this.dispatch('SelectInstrument', number)
    },
    selectedInstrumentRange: function (range) {
      var i1 = this.selectedInstrument()
      this.model.instruments[i1] = extend({},
        this.model.instruments[i1] || BeatModel.defaultInstrument,
        {
          number: i1,
          range: range})
      this.dispatch('SelectInstrumentRange', range)
    },
    instrumentUrl: function (i, newUrl) {
      if (!newUrl) return this.model.instruments[i]
      this.model.instruments[i].url = newUrl
      var cb = this.subscriptions.ChangeUrl
      if (typeof cb === 'function') cb(this)
    },
    instrumentName: function (i, newName) {
      if (!newName) return this.model.instruments[i].name
      this.model.instruments[i].name = newName
      var cb = this.subscriptions.ChangeName
      if (typeof cb === 'function') cb(this)
    },
    toString: function () {
      return JSON.stringify(this.model, 0, 2)
    },
    songName: function (name) {
      if (name) this.model.songName = name
      return this.model.songName
    },
    version: function (ver) {
      if (ver) this.model.version = ver
      return this.model.version
    },
    playing: function (val) {
      if (typeof val !== 'boolean') return this.model.playing
      else this.model.playing = val
      return this.model.playing
    }
  }
  
  function toInt (n) {
    return parseInt(n, 10)
  }
  
  function parseNotePos (str) {
    var numbers = str.split(/[,;:]/)
    if (numbers.length !== 2) throw new Error('NOt a legal note pos ' + str)
    return numbers.map(toInt)
  }
  
  function configLines (text) {
    return text.split(/\n|\r\n/gm).filter(function (line) {
      return !/^\s*$|^\s*#/.test(line)
    })
  }
  
  function readConfig (lines) {
    if (typeof lines === 'string') lines = configLines(lines)
    var configs = {}
    var config
    var m
    for (var i = 0; i < lines.length; i += 1) {
      var line = lines[i]
  
      // config name
      m = /^(\w+[\w\s]+):(.*)$/.exec(line)
      if (m) {
        config = m[1].trim()
        configs[config] = {}
        if (m[2]) configs[config] = m[2].trim()
        continue
      }
  
      // config properties
      m = /^\s+([\w]+):(.*)/.exec(line)
      if (m) {
        if (!config) {
          throw new Error('Expected an config name at line ' + i + 1)
        }
        if (typeof configs[config] === 'string') {
          throw new Error('Cannot add configs to ' + config)
        }
        configs[config][m[1]] = m[2].trim()
      }
    }
    return configs
  }
  
  mixinGetSet(BeatModel, 'bpm', 100)
  mixinGetSet(BeatModel, 'tpb', 4)
  mixinGetSet(BeatModel, 'beats', 4)
  
   var m = bp.model = new BeatModel()
   var live = bp.live
   m.subscribe('SelectInstrument', function () {
     live.instrumentsView1.selectInstrumentNumber()
   })
  
   m.subscribe('SelectInstrumentRange', function () {
     live.instrumentsView1.selectInstrumentRange()
   })
  
   m.subscribe('NewText', function () {
     live.player1.update()
     live.settings.update()
   })
  
   m.subscribe('play', function () {
     live.controlsView1.play()
     live.beatAudio1.play()
     m.playing(true)
   })
  
   m.subscribe('stop', function () {
     live.controlsView1.stop()
     live.beatAudio1.stop()
     m.playing(false)
   })
  
   m.subscribe('playerStep', function (direction) {
     live.player1.step(direction)
   })
  
   m.subscribe('GotoPos', function (pos) {
     live.player1.gotoPos(pos)
     m.position(pos)
   })
  /*global bp, AudioContext */
  
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
    // TODO Move this to model for live record to function
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
      var pos = this.model.position()
      var playThese = this.orderedNotes[pos] || []
      var delta = this.nextTick - this.context.currentTime
      // TODO scale this according to drift
      // TODO live recording, changing bpm
      var timeoutTime = this.secondsPerTick * 1000
      var self = this
  
      this.model.dispatch('GotoPos', pos)
      for (var i = 0; i < playThese.length; i += 1) {
        this.playSample(playThese[i].inst, this.context.currentTime + delta)
      }
      this.timeout = setTimeout(function () {
        pos = self.model.position() + 1
        self.nextTick += self.secondsPerTick
        if (pos === self.patternLength) {
          pos = 0
        }
        self.model.position(pos)
        self._play()
      }, timeoutTime)
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
      source.start(when)
      // source.onended = function () {
      //   console.warn('ended')
      // }
    }
    // TODO Mixing https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
  }
  bp.BeatAudio = BeatAudio
  /*global bp __document requestAnimationFrame htmlEl insertBefore
    appendChild, removeChild mixinDom mixinHandlers css qa qs classRemove classAdd
    elRect attr nextSibling prevSibling $id mixinHideShow eachPush $t $ts
    extend createView
  */
  
  // TODO Grid https://www.reddit.com/r/Frontend/comments/4lkww8/grid_system_research/
  
  const alphaNum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  
  const keyboardKeys = [
    '1234567890',
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM,.']
  
  const keyboardKeyMap = {}
  
  keyboardKeys.join('').split('').forEach(function (k, i) {
    keyboardKeyMap[k] = i
  })
  
  // {{{1 InputHandler
  //
  // ## Global keys
  //
  // space         play, stop
  // esc           move focus out, record
  // 1-9           select instrument
  // qwerty        play sound
  // Left, Right   select view
  //
  // ## Player View keys
  // 1-9, a-z, A-Z  select column
  //
  // TODO Do not depend on device typematic delay
  // TODO Show state and active key being pressed iin footer
  var key0 = '0'.charCodeAt(0)
  var key9 = '9'.charCodeAt(0)
  var keyA = 'A'.charCodeAt(0)
  var keyZ = 'Z'.charCodeAt(0)
  var keyUp = 38
  var keyDown = 40
  var keyLeft = 37
  var keyRight = 39
  var keyEnter = 13
  var keySpace = 32
  var keyEsc = 27
  var keyTab = 9
  
  function InputHandler (o) {
    if (!o.keyboardView) throw new Error('Need o.keyboardView')
    if (!o.player) throw new Error('o.player')
    if (!o.model) throw new Error('o.model')
    this.keyboardView = o.keyboardView
    this.player = o.player
    this.model = o.model
    this.parentEl = __document
    this.view = bp.live[0]
  }
  
  InputHandler.prototype = {
  }
  
  const IH_INIT = 1
  const IH_VIEW = 2
  const IH_END = 3
  
  var ih_state = IH_INIT
  
  mixinHandlers(InputHandler, {
    keydown: function (ev, el) {
      var m = this.model
      var key = translateKey(ev)
      switch (key) {
        case 'space':
          if (!m.playing()) m.dispatch('play')
          else m.dispatch('stop')
          break
        default:
          switch (ih_state) {
            case IH_INIT:
              switch (key) {
                case 'up':
                  this.view = bp.live.stepFocus.prev()
                  this.view.focus()
                  break
                case 'down':
                  this.view = bp.live.stepFocus.next()
                  this.view.focus()
                  break
                case 'right':
                case 'left':
                  ih_state = IH_VIEW
                  this.view.handleKey(key, ev, el)
                  break
                default:
                  // code
              }
              break
            case IH_VIEW:
              switch (key) {
                case 'esc':
                  ih_state = IH_INIT
                  break
                default:
                  this.view.handleKey(key, ev, el)
                  break
              }
              break
            case IH_END:
              break
            default:
              console.warn('Unknown ih_state', ih_state)
              break
          }
      }
      ev.preventDefault()
      ev.stopPropagation()
    },
    keyup: function () {
      console.warn('up', arguments)
    },
    wheel: function () {
      console.warn('scroll', arguments)
    }
  })
  
  // {{{1 old key
  //      if (code <= key9 && code >= key0) {
  //        this.keyboardView.selectInstrument(String.fromCharCode(code))
  //      } else if (code === keyUp) {
  //        console.warn('keyUp')
  //        if (bp.lastPopUp && bp.lastPopUp.keyUp) bp.lastPopUp.keyUp()
  //        ev.preventDefault()
  //      } else if (code === keyDown) {
  //        console.warn('keyDown')
  //        if (bp.lastPopUp && bp.lastPopUp.keyDown) bp.lastPopUp.keyDown()
  //        ev.preventDefault()
  //      } else if (code === keyLeft) {
  //        obj = bp.live.stepFocus.prev()
  //        console.warn('keyLeft', obj)
  //        obj.focus()
  //        if (bp.lastPopUp && bp.lastPopUp.keyLeft) bp.lastPopUp.keyLeft()
  //        ev.preventDefault()
  //      } else if (code === keyRight) {
  //        obj = bp.live.stepFocus.next()
  //        obj.focus()
  //        console.warn('keyRight', obj)
  //        if (bp.lastPopUp && bp.lastPopUp.keyRight) bp.lastPopUp.keyRight()
  //        ev.preventDefault()
  //      } else if (code === keySpace) {
  //        console.warn('keySpace')
  //        ev.preventDefault()
  //      } else if (code === keyEsc) {
  //        console.warn('keyEsc')
  //        if (bp.lastPopUp) bp.lastPopUp.inputEl.hide()
  //        ev.preventDefault()
  //      } else if (code === keyEnter) {
  //        console.warn('keyEnter')
  //        ev.preventDefault()
  //      } else if (code === keyTab) {
  //        console.warn('keyTab')
  //        if (!this.activeTab) this.activeTab = this.keyboardView
  //        this.activeTab.unfocus()
  //        if (this.activeTab === this.keyboardView) this.activeTab = this.player
  //        else this.activeTab = this.keyboardView
  //        this.activeTab.focus()
  //
  //        return ev.preventDefault()
  //      } else {
  //        if (keyboardKeyMap[k]) {
  //          console.warn('play key', k)
  //        }
  //      }
  // 1}}}
  
  function translateKey (ev) {
    // TODO browser compat
    var code = ev.which
    if (code <= key9 && code >= key0) return (code - key0) + ''
    if (code <= keyZ && code >= keyA) {
      code = String.fromCharCode(code)
      if (!ev.shiftKey) code = code.toLowerCase()
      return code
    }
    if (code === keyEnter) return 'enter'
    if (code === keySpace) return 'space'
    if (code === keyEsc) return 'esc'
    if (code === keyUp) return 'up'
    if (code === keyDown) return 'down'
    if (code === keyLeft) return 'left'
    if (code === keyRight) return 'right'
    if (code === keyTab) return 'tab'
    // TODO Handle , and . keys
    return null
  }
  
  // 1}}} InputHandler
  
  // {{{1 KeyboardView
  function KeyboardView (o) {
    o = o || {}
    this.ranges = o.ranges || [
      // Assumption: The array is sorted as the keyboard
      // and intervals do not overlap
      // [1, 'U', 'F'],
      // [2, 'Q', 'R'],
      // [3, 'B', 'M']
    ]
    // TODO o.model.selectedInstrument(o.selectedInstrument || 1)
    // properties on o added
  }
  
  createView(bp, KeyboardView, {
    tpl: function (o) {
      o = o || {}
      return $t('pre', keyboardKeys.map(function (row, j) {
        var chars = row.split('')
        if (j === 0) return $ts('b', chars).join('')
        return (j > 1 ? ' ' : '') + $ts('i', chars).join('')
      }).join('\n'))
    },
    afterAttach: function (el) {
      // Select the active sample
      var samples = qa('b', this.parentEl)
      if (this.lastInstrumentEl) classRemove(this.lastInstrumentEl, 'active-instrument')
      for (var i = 0; i < samples.length; i += 1) {
        var s1 = samples[i]
        var selected = this.model.selectedInstrument()
        if (s1.innerText === selected) {
          classAdd(s1, 'active-instrument')
          this.lastInstrumentEl = s1
          this.vmSave({instrument: i})
          break
        }
      }
      // Set selected ranges
      for (i = 0; i < this.ranges.length; i += 1) {
        var assignment = this.ranges[i]
        var begin = this.findElTypeWithInnerText('i', assignment[1])
        var end = this.findElTypeWithInnerText('i', assignment[2])
        this.markRange(begin, end, assignment[0])
      }
    },
    renderModel: function () {
      // TODO Render model
      this.render({})
    },
    vmSave: function () {
  
    },
    vmLoad: function () {
    },
    // Add span around key range
    markRange: function (beginEl, endEl, instrumentNumber) {
      var begin = beginEl
      var end = endEl
      if (keyboardKeyMap[begin.innerText] > keyboardKeyMap[end.innerText]) {
        begin = endEl
        end = beginEl
      }
      this.model.selectedInstrumentRange([begin.innerText, end.innerText])
      var span = htmlEl('span', {'class': 'color' + instrumentNumber})
      span = insertBefore(begin.parentNode, span, begin)
      while (1) {
        var next = begin.nextSibling
        appendChild(span, begin)
        if (begin === end) break
        begin = next
        if (!begin) break
      }
    },
    findElTypeWithInnerText: function (elType, character) {
      var keys = qa(elType, this.parentEl)
      for (var i = 0; i < keys.length; i += 1) {
        var k1 = keys[i]
        if (k1.innerText === character) return k1
      }
    },
    selectInstrument: function (sample, el) {
      if (!el) el = this.findElTypeWithInnerText('b', sample)
      if (this.lastInstrumentEl) {
        classRemove(this.lastInstrumentEl, 'active-instrument')
      }
      classAdd(el, 'active-instrument')
      this.lastInstrumentEl = el
      this.model.selectedInstrument(sample)
    },
  
    // Keys
    keyLeft: function (ev, el) {
      console.warn('KeyboardView', ev, el)
    },
    keyRight: function (ev, el) {
      console.warn('KeyboardView', ev, el)
    },
    keyUp: function (ev, el) {
      console.warn('KeyboardView', ev, el)
    },
    keyDown: function (ev, el) {
      console.warn('KeyboardView', ev, el)
    }
  
  }, {
    // Handlers
    defaultHandler: function (ev, el) {
      console.warn('defaulth')
      this.focus()
    },
    click: function (event, el) {
      // Instrument
      if (el.nodeName === 'B') {
        this.selectInstrument(el.innerText, el)
      // Keyboard layout
      } else if (el.nodeName === 'I') {
        var parentName = el.parentNode.nodeName
        if (parentName === 'PRE') {
          // Define range for instrument and surround with a span
          if (this.lastKeyEl) {
            classRemove(this.lastKeyEl, 'active-key')
            this.markRange(this.lastKeyEl, el, this.model.selectedInstrument())
            this.lastKeyEl = null
          // Mark the start of the range
          } else {
            classAdd(el, 'active-key')
            this.lastKeyEl = el
          }
        } else if (parentName === 'SPAN') {
          var span = el.parentNode
          var top = span.parentNode
          while ((el = span.firstChild)) {
            insertBefore(top, el, span)
          }
          removeChild(top, span)
          this.model.selectedInstrumentRange()
        }
      }
    }
  }, {
    // Args
    id: 'keyboard'
  })
  
  // 1}}} KeyboardView
  
  // {{{1 SettingsView
  
  function SettingsView () {
  }
  
  createView(bp, SettingsView, {
    tpl: function (o) {
      return $t('dl',
          eachPush([{title: 'Beats Per Minute', abbr: 'BPM', name: 'bpm'},
            {title: 'Ticks Per Beat', abbr: 'TPB', name: 'tpb'},
            {title: 'Total Beats', abbr: 'Beats', name: 'beats'}], function (i, val) {
            return $t('dt',
              $t('abbr', {title: val.title}, val.abbr),
              $t('dd', o[val.name])) }))
    },
    renderModel: function () {
      var m = this.model
      this.render({
        bpm: m.bpm(),
        tpb: m.tpb(),
        beats: m.beats()
      })
    }
  }, {
  }, {
    id: 'settings'
  })
  
  // 1}}}
  
  // {{{1 PlayerView
  // TODO Make scoreSpanTemplate a separate control
  // {{{2 ScoreColumns
  // TODO Merge with focus?
  function ScoreColumns (el) {
    // console.warn(type(el));
    var els = qa('.score-columns p', el).filter(function (el1) {
      // TODO fails if only one instrument
      return el1.childNodes.length > 1
    })
    this.iter = new IterElems(els)
    this.last = els[0]
  }
  
  ScoreColumns.prototype = {
    step: function (direction) {
      var selected = this.iter.step(direction)
      classRemove(this.last, 'active')
      classAdd(selected, 'active')
      this.last = selected
    },
    gotoPos: function (pos) {
      var selected = this.iter.set(pos)
      classRemove(this.last, 'active')
      classAdd(selected, 'active')
      this.last = selected
    }
  }
  // 2}}} ScoreColumns
  
  // {{{2 Instruments
  function Instruments (el) {
    var els = qa('.instruments p', el)
    this.iter = new IterElems(els)
    this.last = els[0]
  }
  
  Instruments.prototype = {
  
  }
  // 2}}} Instruments
  
  function scoreSpanTemplate (length, tpb) {
    var result = []
    for (var i = 0; i < length; i += 1) {
      if (i % tpb === 0) result.push('&nbsp;')
      result.push(decToalphanum(i + 1))
    }
    return $t('span', $ts('i', result))
  }
  
  const emptyCol = $t('p', $t('b', '&nbsp;'))
  
  function PlayerView (o) {
  }
  
  createView(bp, PlayerView, {
    tpl: function (o) {
      var m = this.model
      var t = extend({tracks: o.tracks,
                      length: m.patternLength(),
                      tpb: m.tpb()}, o)
      return [
        $t('div', {'class': 'instruments'},
          eachPush(t.instruments, function (i, i1) {
            return $t('p', i1.name)
          })),
        $t('div', {'class': 'score'},
          scoreSpanTemplate(t.length, t.tpb),
          $t('div', {'class': 'score-columns'},
            eachPush(t.tracks, function (i, val) {
              var result = ''
              if (i % t.tpb === 0) result += emptyCol
              return [result, $t('p', eachPush(val, function (j, val) {
                return $t('b', {'data-pos': i + ',' + j}, val)
              }))]
            })))
      ].join('\n')
    },
    renderModel: function () {
      // Extract the parts needed for the playerview
      var m = this.model
      if (!m) throw new Error('Need model')
  
      var instruments = m.instruments()
      var patternLength = m.patternLength()
      var tracks = []
      var tracksTransposed
      for (var i = 0; i < instruments.length; i += 1) {
        tracks.push(charArray(patternLength, '.'))
        // TODO Instrument lookup in pattern
      }
  
      var patterns = m.patterns()
  
      // FIXME This is an ugly hack to handle initial state of the PlayerView
      if (patterns) {
        var pats = Object.keys(patterns)
        for (i = 0; i < pats.length; i += 1) {
          var p = patterns[pats[i]]
          var cols = Object.keys(p)
          for (var j = 0; j < cols.length; j += 1) {
            tracks[pats[i]][cols[j]] = p[cols[j]]
          }
        }
        tracksTransposed = transpose(tracks)
      }
  
      this.render({
        instruments: instruments,
        tracks: tracksTransposed
      })
    },
    afterAttach: function () {
      if (!this.parentEl) throw new Error('Bad el ' + this.parentEl)
      this.scoreColumns = new ScoreColumns(this.parentEl)
      // this.instruments = new Instruments(this.parentEl)
    },
    gotoPos: function (pos) {
      this.scoreColumns.gotoPos(pos)
    },
    step: function (direction) {
      this.scoreColumns.step(direction)
    },
    stepInstrument: function (direction) {
  
    },
    handleKey: function (key, el) {
      switch (key) {
        case 'right':
          this.step(1)
          break
        case 'left':
          this.step(-1)
          break
        case 'up':
          break
        case 'down':
          break
        default:
          return false
      }
      return true
    }
  }, {
  // Handlers
    click: function (ev, el) {
      // console.warn('You clicked', ev, el, el.parentNode)
      // var rowIndex = [].slice.call(el.parentNode.childNodes).indexOf(el)
      // var columnIndex
      // TODO make this idempotent
      this.focus()
      var r1
      var live = bp.live
      var self = this
      switch (el.nodeName) {
        case 'P':
          console.warn('P Instrument', el)
          // var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
          // falls through
        case 'B':
          r1 = elRect(el)
          var value = el.innerText
          var pos = attr(el, 'data-pos')
          if (!pos) return
          console.warn('POS', pos)
          if (!value || /^\s*$/.test(value)) value = '.'
          live.textInput1.popup({
            top: r1.top,
            left: r1.left,
            width: r1.width,
            value: value,
            // TODO use dispatch on all events
            set: function (value) {
              var pos = attr(el, 'data-pos')
              el.innerText = value
              self.model.note(pos, value)
            }
          })
          ev.preventDefault()
          bp.lastPopUp = bp.live.textInput1
          break
        case 'I': // Click top row to go to position
          console.warn('I', alphanumToDec(el.innerText))
          this.model.dispatch('GotoPos', alphanumToDec(el.innerText) - 1)
          ev.preventDefault()
          ev.stopPropagation()
          break
        case 'ABBR':
          r1 = elRect(qs('dd', el))
          // falls through
        case 'DT':
          // falls through
        case 'DD':
          r1 = elRect(el)
          // if (bp.lastPopUp) bp.lastPopUp.hide()
          bp.sliderInput1.popup({
            top: r1.top,
            left: r1.left,
            value: el.innerText,
            set: function (value) {
              el.innerText = value + ''
            }
          })
          bp.lastPopUp = bp.sliderInput1
          break
      }
      this.focus()
      return ev.stopPropagation()
    }
  }, {
    // Default instance args
    id: 'player1'
  })
  
  function decToalphanum (num) {
    if (num >= alphaNum.length) {
      console.warn('reset num from ', num)
      num = alphaNum.length - 1
      console.warn('reset num to', num)
    }
    return alphaNum[num]
  }
  
  function alphanumToDec (anum) {
    var result = alphaNum.indexOf(anum + '')
    if (result < 0) throw new Error('TODO Beat is too long')
    return result
  }
  
  function charArray (length, character) {
    character = character || '.'
    var result = []
    for (var i = 0; i < length; i += 1) {
      result.push(character)
    }
    return result
  }
  
  function transpose (matrix) {
    var height = matrix.length
    var width = matrix[0].length
    var result = new Array(width)
    for (var i = 0; i < width; i += 1) {
      result[i] = new Array(height)
      for (var j = 0; j < height; j += 1) {
        result[i][j] = matrix[j][i]
      }
    }
    return result
  }
  
  // 1}}} PlayerView
  
  // {{{1 ControlsView
  function ControlsView (o) {
    this.parentEl = $id('controls')
    this.btnPlay = qs('#btn-play', this.parentEl)
    this.btnStop = qs('#btn-stop', this.parentEl)
    mixinFocus(bp.focus, this, 'parentEl', 'focus')
  }
  
  ControlsView.prototype = {
    play: function () {
      classAdd(this.btnPlay, 'hidden')
      classRemove(this.btnStop, 'hidden')
    },
    stop: function () {
      classAdd(this.btnStop, 'hidden')
      classRemove(this.btnPlay, 'hidden')
    }
  }
  
  mixinDom(ControlsView)
  mixinHandlers(ControlsView, {
    click: function () {
      if (bp.model.playing()) {
        bp.model.dispatch('stop')
      } else {
        bp.model.dispatch('play')
      }
    }
  })
  
  // TODO don't create this here
  bp.live.controlsView1 = new ControlsView()
  
  // 1}}} Svg
  
  // {{{1 BeatsView
  function BeatsView (o) {
    this.collection = {}
  }
  
  createView(bp, BeatsView, {
    tpl: function (o) {
      return $t('span', 'Beat',
        $t('select', { type: 'multi' },
          eachPush(o.options, function (i, opt) {
            return $t('option', opt)
          })))
    },
    renderModel: function (o) {
      this.render(o)
    },
    afterRender: function () {
      console.warn('AFTER', this.parentEl)
    }
  }, {
    click: function (ev, el) {
      this.focus()
      if (el.value) {
        this.model.loadBeatUrl('data/' + el.value + '.beat', function (err, model) {
          if (err) throw err
          bp.live.player1.gotoPos(1)
        })
      }
    }
  }, {
    id: 'beatsView'
  })
  
  // 1}}}
  
  // {{{1 InstrumentsView
  function InstrumentsView (o) {
  }
  
  createView(bp, InstrumentsView, {
    tpl: function (o) {
      return [
        $t('h4', 'Instrument ' + o.number),
        $t('dl',
          $t('dt', 'Name'),
          $t('dd', o.name),
          $t('dt', 'Url'),
          $t('dd', o.url),
          o.range ? ($t('dt', 'Range') + $t('dd', o.range)) : '',
          o.buffer ? ($t('dt', 'Time') + $t('dd', Math.round(o.buffer.duration * 100) / 100)) : ''
          )
      ].join('\n')
    },
    renderModel: function () {
      // TODO Render model
      this.render({})
    },
    selectInstrumentNumber: function (number) {
      this.update(this.model.instrument())
    },
    selectInstrumentRange: function (range) {
      this.update(this.model.instrument())
    }
  }, {
    click: function (ev, el) {
      this.focus()
      var name = el.nodeName
      var dtEl
      var ddEl
      if (name === 'DT') {
        dtEl = el
        ddEl = nextSibling(el)
      } else if (name === 'DD') {
        dtEl = prevSibling(el)
        ddEl = el
      }
      if (dtEl && ddEl) {
        var r1 = elRect(ddEl)
        bp.live.textInput1.popup({
          top: r1.top,
          left: r1.left,
          width: r1.width,
          value: ddEl.innerText,
          set: function (value) {
            ddEl.innerText = value
          }
        })
      }
    }
  }, {
    id: 'instruments'
  })
  // 1}}} InstrumentsView
  
  // {{{1 SliderInput
  function SliderInput (o) {
    o = o || {}
    this.parentEl = $id(o.id)
    this.sliderEl = qs('input[type=range]', this.parentEl)
    this.textEl = qs('input[type=text]', this.parentEl)
    if (!this.parentEl) throw new Error('Need o.id')
    if (!this.sliderEl) throw new Error('Need o.sliderEl')
    if (!this.textEl) throw new Error('Need o.textEl')
  }
  
  SliderInput.prototype = {
    tpl: function (o) {
      // TODO Remove this
      return bp.templates.sliderInput(o)
    },
    setRange: function (start, stop, value) {
      value = value || (start + stop) / 2
      attr(this.sliderEl, {min: start,
                              max: stop,
                              value: value})
      this.textEl.value = value
    },
    popup: function (o) {
      if (!this.attached) {
        this.attach(document.body)
        this.attached = true
      }
      // o.value = o.value || this.inputEl.value
      // this.detach()
      // if (o.value !== this.lastValue) this.render(o)
      // this.attach(this.parent)
      css(this.el, {
        position: 'absolute',
        top: o.top + 'px',
        left: o.left + 'px'
      })
      this.sliderEl.value = o.value
      this.textEl.value = o.value
      this.setValue = o.set
      // this.lastValue = this.inputEl.value = o.value
      // this.textEl.focus()
      this.textEl.select()
    }
  }
  
  mixinDom(SliderInput)
  
  mixinHandlers(SliderInput, {
    input: function (ev, el) {
      var v1 = this.sliderEl.value = this.textEl.value = Math.round(el.value)
      if (this.setValue) this.setValue(v1)
      ev.stopPropagation()
    },
    change: function (ev, el) {
      var v1 = this.sliderEl.value = this.textEl.value = Math.round(el.value)
      if (this.setValue) this.setValue(v1)
      ev.stopPropagation()
    },
    keydown: function (ev, el) {
      console.warn('Key i sdown', ev, el)
      ev.stopPropagation()
    }
  })
  // 1}}} Slider Input
  
  // {{{1 TextInput
  function TextInput (o) {
    this.parentEl = $id(o.id)
    if (!this.parentEl) throw new Error('Need parentEl')
    this.inputEl = qs('input', this.parentEl)
    if (!this.inputEl) throw new Error('Need inputEl')
    this.eventsAttach()
  }
  
  TextInput.prototype = {
    popup: function (o) {
      var value = o.value
      css(this.parentEl, {
        position: 'absolute',
        top: o.top + 'px',
        left: o.left + 'px'
      })
      css(this.inputEl, {
        width: o.width + 'px',
        height: o.height + 'px'
      })
      this.setModelValue = o.set
      // TODO Use dispatch instead
      this.show()
      this.inputEl.value = value
      this.parentEl.focus()
      this.inputEl.select()
    },
    popdown: function () {
      this.parentEl.blur()
      this.hide()
    },
    setValue: function (val) {
      this.inputEl.value = val
      if (this.setModelValue) this.setModelValue(val)
      console.warn('VAL', val)
    }
  }
  
  TextInput.create = function (o) {
    return new TextInput(o)
  }
  
  mixinHideShow(TextInput)
  
  mixinHandlers(TextInput, {
    keypress: function (ev, el) {
      // TODO get the key from the global input handler to handle when focus lost
      var key = String.fromCharCode(ev.keyCode).toLowerCase()
      if (/^[\s\b]*$/.test(key)) key = '.'
      this.setValue(key)
      ev.preventDefault()
    }
  })
  // 1}}} TextInput
  
  // {{{1 Samples
  function Samples () {
  }
  
  mixinDom(Samples)
  
  Samples.prototype = {
    draw: function (el) {
      bp.templates.keyboard({
      })
    }
  }
  
  // 1}}} Samples
  /*global ready bp TextInput SliderInput InputHandler stepIter BeatAudio */
  
  // TODO use model for defaults
  var defaultOptions = {
    beatsView: {
      id: 'beatView',
      options: ['beat0', 'beat1', 'beat2', 'beat3']
    },
    settingsView1: {
      tpb: 4,
      beats: 12
    }
  }
  
  ready(function () {
    bp.started = Date.now()
    var live = bp.live
  
    Object.keys(live).forEach(function (name) {
      console.warn('live', name)
      var l1 = live[name]
      if (typeof l1.renderModel === 'function') {
        l1.renderModel(defaultOptions[name])
      }
      l1.attach()
    })
  
    live.inputHandler1 = new InputHandler({
      model: bp.model,
      keyboardView: live.keyboard,
      player: live.player1
    })
    live.inputHandler1.eventsAttach()
  
    live.textInput1 = TextInput.create({id: 'textInput1'})
    live.sliderInput1 = SliderInput.create({id: 'sliderInput1'})
  
    live.beatAudio1 = new BeatAudio(bp.model)
  
    // TODO handle focus with mouse
    live.stepFocus = new IterElems([
      live.beatsView,
      live.settings,
      live.controlsView1,
      live.player1,
      live.keyboard,
      live.instruments
    ])
    live.stepFocus.get().focus()
  
  
    m.loadBeatUrl('data/beat0.beat', function (err, model) {
      if (err) throw err
      console.warn('Loaded beat1')
      live.player1.detach()
      live.player1.renderModel()
      live.player1.attach()
      live.player1.gotoPos(0)
    })
  })
  
  
  var count = 1000
  
  function timeOuter() {
    if (count > 0) {
      count -= 1
      setTimeout(timeOuter, 10)
      console.warn('time')
    }
  }
  
  bp.test.beatModel = function () {
    var bm1 = new BeatModel()
    bm1.loadBeatUrl('data/beat0.beat', function (err, model) {
      if (err) throw err
      console.warn('Loaded', model)
      console.warn('instruments', model.instruments())
    })
  }
  bp.test.player = function () {
    var bm1 = new BeatModel()
    bm1.loadBeatUrl('data/beat1.beat', function (err, model) {
      if (err) throw err
      var pl1 = PlayerView.create({
        model: model
      })
      pl1.renderModel()
      pl1.attach('#test1')
    })
  }
  
  ready(function () {
    console.warn('Test')
  })
}())

// Include definitions for timber v0.1.1
var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    },
    regex = new RegExp(Object.keys(escapeMap).join('|'), 'g');

function escapeHtml(aString) {
    return (aString + '').replace(regex, function (ch) {
        return escapeMap[ch];
    });
}

function escapeText(t) {
   return (t + '').replace(/(")/g, '\\"');
}

function escapeJson(o) {
  return JSON.stringify(o, 0, 2);
}

function escapeNone(o) { return o + ''; }


// Timber templates v0.1.1 compiled 2016-05-21T00:56:45.701Z
bp.templates = {
  column: function (o) {
  var result =   "<p>\n";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "  <b>" + escapeHtml(v1) + "</b>\n";
  }
  result += "</p>\n";
return result; }
,
  columnEmpty: function (o) {
  var result =   "<p><b>&nbsp;</b></p>\n";
return result; }
,
  instrument: function (o) {
  var result =   "<h4>instrument " + escapeHtml(o.number) + "</h4><dl><dt>Name</dt><dd>" + escapeHtml(o.name) + "</dd><dt>Url</dt><dd>" + escapeHtml(o.url) + "</dd>";
  if (o.range) {
    result +=     "<dt>Range</dt><dd>" + escapeHtml(o.range) + "</dd>";
  }
  result += "";
  if (o.buffer) {
    result +=     "<dt>Duration</dt><dd>" + escapeHtml(Math.round(o.buffer.duration * 100) / 100) + "</dd>";
  }
  result += "</dl>";
return result; }
,
  instruments: function (o) {
  var result =   "";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "  <p>" + escapeHtml(v1.name) + "</p>\n";
  }
  result += "";
return result; }
,
  keyboard: function (o) {
  var result =   "<pre>\n";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "  " + (v1) + "\n";
  }
  result += "</pre>\n";
return result; }
,
  keyboardRow: function (o) {
  var result =   "";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "<b>" + escapeHtml(v1) + "</b>";
  }
  result += "";
return result; }
,
  player: function (o) {
  var result =   "<div class=settings>\n" + (o.settings) + "\n</div>\n<div class=instruments>\n" + (o.instruments) + "\n</div>\n<div class=score>\n" + (o.score) + "\n<div class=score-columns>\n" + (o.columns) + "\n</div>\n</div>\n";
return result; }
,
  scoreSpan: function (o) {
  var result =   "<span>\n<i>&nbsp;</i>\n";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "  <i>" + escapeHtml(v1) + "</i>\n";
  }
  result += "</span>\n";
return result; }
,
  settings: function (o) {
  var result =   "<dl>\n  <dt><abbr title=\"Beats Per Minute\">BPM</abbr></dt> <dd>" + escapeHtml(o.bpm) + "</dd>\n  <dt><abbr title=\"Ticks Per Beat\">LPB</abbr></dt> <dd>" + escapeHtml(o.tpb) + "</dd>\n  <dt><abbr title=\"Total Beats\">Beats</abbr></dt> <dd>" + escapeHtml(o.beats) + "</dd>\n</dl>\n";
return result; }
,
  sliderInput: function (o) {
  var result =   "<div id=\"slider1\" class=\"slider-input\">\n  <input type=\"text\" name=\"val\" value=\"" + escapeText(o.value) + "\">\n  <input orient=\"vertical\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"\n         value=\"" + escapeText(o.value) + "\">\n</div>\n";
return result; }

};

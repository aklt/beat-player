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


// Timber templates v0.1.1 compiled 2016-06-06T20:28:42.890Z
bp.templates = {
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
  sliderInput: function (o) {
  var result =   "<div id=\"slider1\" class=\"slider-input\">\n  <input type=\"text\" name=\"val\" value=\"" + escapeText(o.value) + "\">\n  <input orient=\"vertical\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"\n         value=\"" + escapeText(o.value) + "\">\n</div>\n";
return result; }

};


TEMPLATES=$(wildcard templates/*.html)

all: style.css templates.js bp.js bp-min.js

style.css: style.less
	lessc $< > $@

templates.js: $(TEMPLATES)
	timber builtin                > $@
	timber templates ab.templates >> $@

bp.js: beat-model.js beat-audio.js beat-player.js templates.js beat-ready.js
	./node_modules/ab.js/bin/ab.js cat $^ > $@

bp-min.js: bp.js
	uglifyjs bp.js -c -m > $@

.PHONY: clean dev

dev:
	freshen

clean:
	rm -fv templates.js style.css

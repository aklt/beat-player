
TEMPLATES=$(wildcard templates/*.html)

all: style.css templates.js bp.js

style.css: style.less
	lessc $< > $@

templates.js: $(TEMPLATES) makefile
	timber builtin                > $@
	timber templates bp.templates >> $@

bp.js: model.js audio.js view.js templates.js ready.js
	./node_modules/ab.js/bin/ab.js cat $^ > $@

bp-min.js: bp.js
	uglifyjs bp.js -c -m > $@

.PHONY: clean dev tags

tags:
	tagdir
	ls -l

dev:
	freshen

clean:
	rm -fv templates.js style.css bp.js

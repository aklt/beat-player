
TEMPLATES=$(wildcard templates/*.html)
JS=lib.js model.js audio.js view.js templates.js ready.js test.js

all: style.css screen.css print.css ie.css templates.js bp.js bp-uglify.js bp-closure.js

screen.css: sass/screen.sass
	compass compile

print.css: sass/print.sass
	compass compile

ie.css: sass/ie.sass
	compass compile

style.css: style.less
	lessc $< > $@

templates.js: $(TEMPLATES) makefile
	timber builtin                > $@
	timber templates bp.templates >> $@

bp.js: bp.sh $(JS)
	./bp.sh > $@

bp-uglify.js: bp.js
	uglifyjs bp.js -c -m > $@

bp-closure.js: bp.js
	closure-compiler-min $< > $@

.PHONY: clean dev tags

tags:
	tagdir
	ls -l

dev:
	freshen

clean:
	rm -fv templates.js style.css bp.js bp-uglify.js bp-closure.js print.css screen.css ie.css

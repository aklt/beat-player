
TEMPLATES=$(wildcard templates/*.html)
JS=lib.js model.js audio.js view.js templates.js ready.js test.js
compassCompile=bundle exec compass compile --no-debug-info
compassStats=bundle exec compass stats

all: style.css screen.css print.css templates.js bp.js bp-uglify.js bp-closure.js

screen.css: sass/screen.sass
	$(compassCompile)

print.css: sass/print.sass
	$(compassCompile)

ie.css: sass/ie.sass
	$(compassCompile)

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

.PHONY: install clean dev tags distclean

install:
	bundler install --path .install

tags:
	tagdir
	ls -l bp*.js
	$(compassStats)

dev:
	freshen

clean:
	rm -fv templates.js style.css bp.js bp-uglify.js bp-closure.js print.css screen.css ie.css

distclean:
	rm -frv .install .bundle .sass-cache


JS=lib.js model.js audio.js view.js ready.js test.js
compassCompile=bundle exec compass compile --no-debug-info
compassStats=bundle exec compass stats

.PHONY: install clean dev tags distclean min

all: style.css screen.css print.css bp.js


screen.css: sass/screen.sass
	$(compassCompile)

print.css: sass/print.sass
	$(compassCompile)

ie.css: sass/ie.sass
	$(compassCompile)

style.css: style.less
	lessc $< > $@

bp.js: bp.sh $(JS)
	./bp.sh > $@


min: bp-uglify.js bp-closure.js

bp-uglify.js: bp.js
	uglifyjs bp.js -c -m > $@

bp-closure.js: bp.js
	closure-compiler-min $< > $@

install:
	bundler install --path .install
	(cd sass && bourbon install)
	(cd sass && neat install)

tags:
	tagdir
	ls -l bp*.js
	$(compassStats)

dev:
	freshen

clean:
	rm -fv style.css bp.js bp-uglify.js bp-closure.js print.css screen.css ie.css

distclean:
	rm -frv .install .bundle .sass-cache

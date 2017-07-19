
JS=lib.js model.js audio.js view.js ready.js test.js
TESTS=$(patsubst %.coffee, %.js, $(wildcard test/*.coffee))
compassCompile=bundle exec compass compile --no-debug-info
compassStats=bundle exec compass stats

.PHONY: install clean dev tags distclean

all: screen.css bp.js $(TESTS)

bp.js: bp.sh $(JS)
	./bp.sh $(JS) > $@

install:
	bundler install --path .install
	(cd sass && bourbon install)
	(cd sass && neat install)

test/%.js: test/%.coffee
	npm run build-test -- $<

tags:
	tagdir
	ls -l bp*.js

dev:
	freshen

clean:
	rm -fv style.css bp.js bp-uglify.js bp-closure.js print.css screen.css ie.css \
		     test/*.js

distclean:
	rm -frv .install .bundle .sass-cache

%.css: %.sass
	sassc --sass $< > $@


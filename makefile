
JS=lib.js model.js audio.js view.js ready.js test.js
TESTS=$(patsubst %.coffee, %.js, $(wildcard test/*.coffee))

.PHONY: clean dev tags

all: screen.css bp.js $(TESTS)

bp.js: bp.sh $(JS)
	./bp.sh $(JS) > $@

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

%.css: %.sass
	sassc --sass $< > $@


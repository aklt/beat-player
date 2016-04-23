
TEMPLATES=$(wildcard templates/*.html)

all: style.css templates.js

style.css: style.less
	lessc $< > $@

templates.js: $(TEMPLATES)
	timber builtin                > $@
	timber templates ab.templates >> $@

.PHONY: clean

clean:
	rm -fv templates.js style.css

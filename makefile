
all: style.css

style.css: style.less
	lessc $< > $@

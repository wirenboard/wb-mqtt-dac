all:
	-@echo do nothing

install:
	install -d $(DESTDIR)/var/lib/wb-mqtt-dac/conf.d
	install -Dm0644 wb-mqtt-dac.js -t $(DESTDIR)/usr/share/wb-rules-system/rules/

clean:
	-@echo "do nothing"

.PHONY: install clean all




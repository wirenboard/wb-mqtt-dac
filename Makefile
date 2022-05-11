all:
	-@echo do nothing

install:
	mkdir -p $(DESTDIR)/usr/share/wb-rules-system/rules/
	install -d $(DESTDIR)/var/lib/wb-mqtt-dac/conf.d
	install -m 0644 wb-mqtt-dac.js $(DESTDIR)/usr/share/wb-rules-system/rules/

clean:
	-@echo "do nothing"

.PHONY: install clean all




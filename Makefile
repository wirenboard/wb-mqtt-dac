all:
	-@echo do nothing

install:
	mkdir -p $(DESTDIR)/usr/share/wb-rules-system/rules/
	install -m 0644 wb-mqtt-dac.js $(DESTDIR)/usr/share/wb-rules-system/rules/
	install -m 0644 wb-mqtt-dac.schema.json $(DESTDIR)/usr/share/wb-mqtt-confed/schemas/
	install -m 0644 config.json $(DESTDIR)/etc/wb-mqtt-dac.conf

clean:
	-@echo "do nothing"

.PHONY: install clean all




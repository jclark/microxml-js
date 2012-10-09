tests.js: tests.json
	(printf "MicroXML.tests="; cat tests.json) >tests.js

clean:
	rm -f tests.js


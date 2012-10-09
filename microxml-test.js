// This runs the tests in tests.json using JsTestDriver
// tests.json needs to be prefixed with "MicroXML.tests=" and loaded before this gets run.

MicroXMLTest = TestCase("MicroXMLTest");

(function() {
    // Have to have a little helper function here to make closures work right.
    function def(source, result) {
	return function () {
	    var actualResult = undefined;
	    var expection = undefined;
	    expectAsserts(1);
            try {
		actualResult = MicroXML.parse(source);
            }
            catch (e) {
		exception = e;
            }
            if (result === undefined) {
		assertInstanceOf(MicroXML.ParseError, exception);
            }
            else {
		assertEquals(result, actualResult);
            }
	};
    }
    var i;
    for (i = 0; i < MicroXML.tests.length; i++) {
	var t = MicroXML.tests[i];
	MicroXMLTest.prototype["test " + t.id] = def(t.source, t.result);
    }
})();


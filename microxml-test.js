// This runs the tests in tests.json using JsTestDriver

MicroXMLTest = TestCase("MicroXMLTest");

(function() {
    // Have to have a little helper function here to make closures work right.
    function def(source, result) {
	return function () {
	    var actualResult = undefined;
	    var exception = undefined;
	    expectAsserts(1);
            try {
		actualResult = MicroXML.parse(source);
            }
            catch (e) {
		exception = e;
            }
            if (result === undefined) {
		assertInstanceOf("non-conformance not detected:", MicroXML.ParseError, exception);
            }
            else {
		assertEquals("incorrect parse result:", result, actualResult);
            }
	};
    }
    var i;
    var tests;
    var request = new XMLHttpRequest();
    request.open("GET", "/test/tests.json", false);
    request.send();
    tests = JSON.parse(request.responseText);
    for (i = 0; i < tests.length; i++) {
	var t = tests[i];
	MicroXMLTest.prototype["test " + t.id] = def(t.source, t.result);
    }
})();


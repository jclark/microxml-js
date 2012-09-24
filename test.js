/* This runs under the SpiderMonkey shell
   e.g. js -f tests.js */

load("microxml.js");
var tests = JSON.parse(read("tests.json"));

var t, i, r;
var nPassed = 0;
var nFailed = 0;
for (i = 0; i < tests.length; i++) {
    t = tests[i];
    try {
	r = MicroXML.parse(t.source);
	if (!t.result) {
	    print("Test " + t.id + " was incorrectly reported as conforming");
	    ++nFailed;
	}
	else if (equal(r, t.result))
	    ++nPassed;
	else {
	    ++nFailed;
	    print("Results not equal for test " + t.id);
	}
    }
    catch (e) {
	if (e.origin === "MicroXML") {
	    if (t.result) {
		print("Test " + t.id + " was incorrectly reporting as non-conforming (" + e.message + ")");
		++nFailed;
	    }
	    else
		++nPassed;
	}
	else {
	    print("Internal error on test " + t.id);
	    ++nFailed;
	}
    }
}

print("Passed " + nPassed + " tests; failed " + nFailed + " tests");

function equal(v1, v2) {
    if (typeof(v1) === 'object' && typeof(v2) === 'object') {
	for (p in v1) {
	    if (v1.hasOwnProperty(p) &&
		(!v2.hasOwnProperty(p) || !equal(v1[p], v2[p])))
		return false;
	}
	for (p in v2) {
	    if (v2.hasOwnProperty(p) && !v1.hasOwnProperty(p))
		return false;
	}
	return true;
    }
    return v1 === v2;
} 

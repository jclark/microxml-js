#!/usr/bin/env js -f

load("microxml.js");
load("unicode.js");

function runTestSuite(suiteName, print, map) {
    var nPassed = 0;
    var nFailed = 0;
    map(function (t) {
        var id = suiteName + ":" + t.id;
        try {
            r = MicroXML.parse(t.source);
            if (!t.result) {
                print("Test " + id + " was incorrectly reported as conforming");
                ++nFailed;
            }
            else if (deepEqual(r, t.result))
                ++nPassed;
            else {
                ++nFailed;
                print("Results not equal for test " + id);
            }
        }
        catch (e) {
            if (e instanceof MicroXML.ParseError) {
                if (t.result) {
                    print("Test " + id + " was incorrectly reporting as non-conforming (" + e.message + ")");
                    ++nFailed;
                }
                else
                    ++nPassed;
            }
            else {
                print("Internal error on test " + id + " (" + e + ")");
                ++nFailed;
            }
        }
    });
    print(suiteName + ": passed " + nPassed + " tests; failed " + nFailed + " tests");
}

function deepEqual(v1, v2) {
    var p;
    if (typeof(v1) === 'object' && typeof(v2) === 'object') {
        for (p in v1) {
            if (v1.hasOwnProperty(p) &&
                (!v2.hasOwnProperty(p) || !deepEqual(v1[p], v2[p])))
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

function runJsonTests(filename, runner, print) {
    var tests = JSON.parse(read(filename));
    runner(filename, print, function (run) {
	var i;
	for (i = 0; i < tests.length; i++) {
            run(tests[i]);
	}
	});
}

function runAllTests(runner, print) {
    runJsonTests("tests.json", runner, print);
    runner("nameStartCharTests", print, nameStartCharTests);
    runner("charTests", print, charTests);
    runner("charRefTests", print, charRefTests);
    runner("nameCharTests", print, nameCharTests);
}

runAllTests(runTestSuite, print);



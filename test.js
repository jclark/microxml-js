#!/usr/bin/env js -f
// Run tests under the SpiderMonkey shell

load("microxml.js");
load("unicode.js");

function runTestSuite(suiteName, map) {
    var nPassed = 0;
    var nFailed = 0;
    map(function (id, source, result) {
        var r;
        try {
            r = MicroXML.parse(source);
            if (!result) {
                print("Test " + id + " was incorrectly reported as conforming");
                ++nFailed;
            }
            else if (deepEqual(r, result))
                ++nPassed;
            else {
                ++nFailed;
                print("Results not equal for test " + id);
            }
        }
        catch (e) {
            if (e instanceof MicroXML.ParseError) {
                if (result) {
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

function runJSONTests(filename) {
    runTestSuite(filename,
        function (run) {
            var tests = JSON.parse(read(filename));
            var i;
            for (i = 0; i < tests.length; i++) {
                var t = tests[i];
                run(filename + t.id, t.source, t.result);
            }
        });
}

runJSONTests("tests.json");
print("Running exhaustive Unicode tests. This will take a few minutes...")
runTestSuite("unicode", runUnicodeTests);


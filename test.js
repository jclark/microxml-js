#!/usr/bin/env js -f

load("microxml.js");
load("unicode.js");

function runTestSuite(suiteName, tests) {
    var t, i, r;
    var id;
    var nPassed = 0;
    var nFailed = 0;
    for (i = 0; i < tests.length; i++) {
        t = tests[i];
        id = suiteName + ":" + t.id;
        try {
            r = MicroXML.parse(t.source);
            if (!t.result) {
                print("Test " + id + " was incorrectly reported as conforming");
                ++nFailed;
            }
            else if (equal(r, t.result))
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
                print("Internal error on test " + id);
                ++nFailed;
            }
        }
    }

    print(suiteName + ": passed " + nPassed + " tests; failed " + nFailed + " tests");
}

function equal(v1, v2) {
    var p;
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

runTestSuite("tests.json", JSON.parse(read("tests.json")));
runTestSuite("nameCharTests", nameCharTests());
runTestSuite("nameStartCharTests", nameStartCharTests());
runTestSuite("charTests", charTests());
runTestSuite("charRefTests", charRefTests());


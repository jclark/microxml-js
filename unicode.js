
var forbiddenRanges = [
    [0x0, 0x1F],
    [0x7F, 0x9F],
    [0xD800, 0xDFFF],
    [0xFDD0, 0xFDEF],
    [0xFFFE, 0xFFFF],
    [0x1FFFE, 0x1FFFF],
    [0x2FFFE, 0x2FFFF],
    [0x3FFFE, 0x3FFFF],
    [0x4FFFE, 0x4FFFF],
    [0x5FFFE, 0x5FFFF],
    [0x6FFFE, 0x6FFFF],
    [0x7FFFE, 0x7FFFF],
    [0x8FFFE, 0x8FFFF],
    [0x9FFFE, 0x9FFFF],
    [0xAFFFE, 0xAFFFF],
    [0xBFFFE, 0xBFFFF],
    [0xCFFFE, 0xCFFFF],
    [0xDFFFE, 0xDFFFF],
    [0xEFFFE, 0xEFFFF],
    [0xFFFFE, 0xFFFFF],
    [0x10FFFE, 0x10FFFF]
];

function C(ch) {
    return ch.charCodeAt(0);
}

var nameStartRanges = [
    [C("A"), C("Z")],
    [C("a"), C("z")],
    [C("_"), C("_")],
    [0xC0, 0xD6],
    [0xD8, 0xF6],
    [0xF8, 0x2FF],
    [0x370, 0x37D],
    [0x37F, 0x1FFF],
    [0x200C, 0x200D],
    [0x2070, 0x218F],
    [0x2C00, 0x2FEF],
    [0x3001, 0xD7FF],
    [0xF900, 0xEFFFF]
];

var nameRanges = [
    [C("0"), C("9")],
    [C("-"), C("-")],
    [C("."), C(".")],
    [0xB7, 0xB7],
    [0x0300, 0x036F],
    [0x203F, 0x2040]
];
    
function markRanges(ranges, val) {
    for (i = 0; i < ranges.length; ++i) {
	for (j = ranges[i][0]; j <= ranges[i][1]; j++) {
	    if (chars[j]) {
		chars[j] = val;
	    }
	}
    }
}

var i, j;
var chars = [];

for (i = 0; i <= 0x10ffff; i++) {
    chars[i] = true;
}

markRanges(forbiddenRanges, false);

var ws = " \n\t";

for (i = 0; i < ws.length; i++)
    chars[ws.charCodeAt(i)] = true;

markRanges(nameStartRanges, 1);
markRanges(nameRanges, 2);


function charTests(run) {
    var test = { };
    var i;
    var ch;
    var text;
    test.source = "<c>";
    text = "";
    for (i = 0; i <= 0x10ffff; i++) {
	if (chars[i]) {
	    ch = encodeUTF16(i);
	    if (ch != "<" && ch != ">" && ch != "&") {
		test.source += ch;
		text += ch;
	    }
	}
    }
    test.id = "good";
    test.source += "</c>";
    test.result = ["c", {}, [text]];
    run(test);
    for (i = 0; i <= 0x10ffff; i++) {
	if (!chars[i] && i !== "\r".charCodeAt(0)) {
	    test = { };
	    test.source = "<c>" + encodeUTF16(i) + "</c>";
	    test.id = "bad-" + i.toString(16).toUpperCase();
	    run(test);
	}
    }
}

function charRefTests(run) {
    var test = { };
    var i;
    for (i = 0; i <= 0x10ffff; i++) {
	test = { };
	test.source = "<c>&#x" + i.toString(16) + ";</c>";
	if (chars[i]) {
	    test.result = ["c", {}, [encodeUTF16(i)]];
	    test.id = "good-";
	}
	else {
	    test.id = "bad-";
	}
	test.id += i.toString(16).toUpperCase();	
	run(test);
    }
}
	
function nameStartCharTests(run) {
    var test;
    var i;
    var ch;

    for (i = 0; i <= 0x10ffff; ++i) {
	test = {};
	ch = encodeUTF16(i);
	test.source = "<" + ch + "X/>";
	if (chars[i] === 1) { 
	    test.result = [ch + "X",{},[]];
	    test.id = "good-";
	}
	else {
	    test.id = "bad-";
	}
	test.id += i.toString(16).toUpperCase();
	run(test);
    }
}

function nameCharTests(run) {
    var test;
    var i;
     var name = "";

    test = {};
    test.id = "good";
    name = "X";
    for (i = 0; i <= 0x10ffff; ++i) {
	if (chars[i] === 1 || chars[i] === 2) {
	    name += encodeUTF16(i);
	}
    }
    test.source = "<" + name + "/>";
    test.result = [name,{},[]];
    run(test);

    for (i = 0x21; i <= 0x10ffff; ++i) {
	if (chars[i] !== 1 && chars[i] !== 2) {
	    test = {};
	    test.source = "<X" + encodeUTF16(i) + "/>";
	    test.id = "bad-" + i.toString(16).toUpperCase();
	    run(test);
	}
    }
}

function encodeUTF16(codePoint) {
    if (codePoint < 0x10000)
	return String.fromCharCode(codePoint);
    codePoint -= 0x10000;
    return String.fromCharCode((codePoint >> 10) | 0xD800, (codePoint & 0x3FF) | 0xDC00);
}


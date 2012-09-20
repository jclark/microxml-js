var MicroXML = { };
/*
TODO:
Comments
Illegal characters
Surrogates
Unicode names
*/
MicroXML.parse = function(source) {
    "use strict";
    var pos = 0;
    var curChar = source.charAt(0);

    var error = function(type) {
	var args = [];
	var i;
	for (i = 1; i < arguments.length; ++i)
	    args += arguments[i];
	throw({
	    name: "ParseError",
	    errorType: type,
	    args: args,
	    position: pos
	});
    }

    var advance = function() {
	curChar = source.charAt(++pos);
    }

    var expect = function(ch) {
	if (curChar != ch)
	    error("expected", ch);
	advance();
    }

    var tryChar = function(ch) {
	if (curChar === ch) {
	    advance();
	    return true;
	}
	return false;
    }

    var tryS = function() {
	if (curChar === ' ' || curChar === '\r' || curChar === '\n' || curChar === '\t') {
	    advance();
	    return true;
	}
	return false;
    }

    var nameStartCharRegexp = /^[A-Za-z_]$/;

    var tryNameStartChar = function() {
	if (nameStartCharRegexp.test(curChar)) {
	    advance();
	    return true;
	}
	return false;
    }

    var nameCharRegexp = /^[-._A-Za-z0-9]$/;

    var tryNameChar = function() {
	if (nameCharRegexp.test(curChar)) {
	    advance();
	    return true;
	}
	return false;
    }

    var parseDocument = function() {
	var result;
	if (curChar === "\uFEFF")
	    advance();
	while (tryS())
	    ;
	expect("<");
	result = parseElement();
	while (tryS())
	    ;
	if (curChar !== "")
	    error("syntax");
	return result;
    }

    var parseName = function() {
	var startPos = pos;
	if (!tryNameStartChar())
	    error("syntax");
	while (tryNameChar())
	    ;
	return source.slice(startPos, pos);
    }

    var hexCharRegexp = /^[a-fA-F0-9]$/;
    var charNames = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'"};

    var parseCharRef = function() {
        if (tryChar("#")) {
            expect("x");
            var startPos = pos;
            while (hexCharRegexp.test(curChar))
                advance();
            var hexNumber = source.slice(startPos, pos);
            expect(";");
            var codePoint = parseInt(hexNumber, 16);
            if (codePoint > 0x10FFFF)
                error("codePointTooBig", hexNumber);
            if (codePoint < 0x10000)
                return String.fromCharCode(codePoint);
            if ((codePoint & 0xFFFE) === 0xFFFE)
                error("nonCharacterCodePoint", hexNumber);
            codePoint -= 0x10000;
            return String.fromCharCode((codePoint >> 10) | 0xD800, (codePoint & 0x3FF) | 0xDC00);
        }
        else {
            var name = parseName();
            expect(";");
            var ch = charNames[name];
            if (typeof(ch) != "string")
                error("badCharName", name);
            return ch;
        }
    }

    /* current char is whitespace before attribute
     return true if attribute was parsed */
    var tryParseAttribute = function(attributeMap) {
	if (!tryS())
	    return false;
	while (tryS())
	    ;
	var startPos = pos;
	if (!tryNameStartChar())
	    return false;
	while (tryNameChar())
	    ;
	var name = source.slice(startPos, pos);
        // Give the error has early as possible so that the position is correct
        if (attributeMap.hasOwnProperty(name))
            error("duplicateAttribute", name);
	while (tryS())
	    ;
	expect("=");
	while (tryS())
	    ;
	if (curChar !== '"' && curChar !== "'")
	    error("unquotedAttribute");
	var quote = curChar;
	advance();
	var value = "";
	while (curChar !== quote) {
            switch (curChar) {
                case "":
                case "<":
                    error("missingQuote");
                case ">":
                    error("unescapedGtAttributeValue");
                case "&":
                    advance();
                    value += parseCharRef();
                    break;
                case "\r":
                    advance();
                    if (curChar === "\n")
                        advance();
                    value += "\n";
                    break;
                default:
                    value += curChar;
                    advance();
                    break;
            }
	}
	advance();
        if (name === "__proto__")
            Object.defineProperty(attributeMap, name,
                {value: value, enumerable: true, writable:true, configurable:true});
        else
	    attributeMap[name] = value;
	return true;
    }

    /* precondition: current char is character after "<";
       postcondition: current char is character after ">"
       returns data model for element */

    var parseElement = function() {
	var name = parseName();
	var content = [];
	var attributeMap = { };
	var text = "";
	
	while (tryParseAttribute(attributeMap))
	    ;
	expect(">");

	for (;;) {
            switch (curChar) {
                case "<":
                    advance();
                    if (tryChar("/")) {
                        var endName = parseName();
                        if (endName !== name)
                            error("endTagMismatch", name, endName);
                        while (tryS())
                            ;
                        expect(">");
                        if (text)
                            content.push(text);
                        return [name, attributeMap, content];
                    }
                    else {
                        if (text) {
                            content.push(text);
                            text = "";
                        }
                        content.push(parseElement());
                    }
                    break;
                case "&":
                    advance();
                    text += parseCharRef();
                    break;
                case "\r":
                    advance();
                    if (curChar === "\n")
                        advance();
                    text += "\n";
                    break;
                case ">":
                    error("unescapedGtContent");
                case "":
                    error("missingEndTag", name);
                    break;
                default:
                    text += curChar;
                    advance();
                    break;
            }
	}
    }
    
    return parseDocument();
}


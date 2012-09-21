var MicroXML = { };
/*
TODO:
Better errors
*/
MicroXML.parse = function(source) {
    "use strict";
    var pos = 0;
    var curChar = source.charAt(0);

    var error = function (type) {
        var args = [];
        var i;
        for (i = 1; i < arguments.length; ++i)
            args += arguments[i];
        throw({
            name:"ParseError",
            errorType:type,
            args:args,
            position:pos
        });
    };

    var advance = function() {
	curChar = source.charAt(++pos);
    };

    var expect = function(ch) {
	if (curChar != ch)
	    error("expected", ch);
	advance();
    };

    var tryChar = function(ch) {
	if (curChar === ch) {
	    advance();
	    return true;
	}
	return false;
    };

    var tryS = function() {
	if (curChar === ' ' || curChar === '\r' || curChar === '\n' || curChar === '\t') {
	    advance();
	    return true;
	}
	return false;
    };

    /* These regexes don't include surrogates; we handle these separately. */
    var nameStartCharRegexp = /^[A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u0037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/;
    var nameCharRegexp = /^[-A-Za-z_0-9.\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u0037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/;

    var tryNameStartChar = function() {
	if (nameStartCharRegexp.test(curChar)) {
	    advance();
	    return true;
	}
	return tryNameSurrogate();
    };


    var tryNameChar = function() {
	if (nameCharRegexp.test(curChar)) {
	    advance();
	    return true;
	}
	return tryNameSurrogate();
    };

    var tryNameSurrogate = function() {
        if (curChar < "\uD800" || curChar > "\uDB7F" || pos + 1 === source.length)
            return false;
        var code2 = source.charCodeAt(pos + 1);
        if ((code2 & 0x3FE) === 0x3FE) {
            var code1 = curChar.charCodeAt(0);
            if ((code1 & 0x3F) === 0x3F)
                return false;
        }
        pos += 2;
        curChar = source.charAt(pos);
        return true;
    };

    var parseDocument = function() {
	var result;
	if (curChar === "\uFEFF")
	    advance();
        for (;;) {
            while (tryS())
                ;
            expect("<");
            if (curChar !== "!")
                break;
            advance();
            parseComment();
        }
	result = parseElement();
        for (;;) {
            while (tryS())
                ;
            if (curChar === "")
                return result;
            if (curChar !== "<")
                break;
            advance();
            if (!tryChar("!"))
                break;
            parseComment();
        }
        error("onlyCommentAfterDocumentElement");
	return result;
    };

    /* precondition: current char is after "!"
    postcondition: current char is after closing ">"
     */
    var parseComment = function() {
        expect("-");
        expect("-");
        for (;;) {
            if (curChar > ">")
                parseSafeChars();
            switch (curChar) {
                case "":
                    error("missingCommentClose");
                case "-":
                    advance();
                    if (tryChar("-")) {
                        expect(">");
                        return;
                    }
                    break;
                default:
                    if (curChar < " ")
                        error("controlChar");
                    /* fall through */
                case "\n":
                case "\r":
                case "\t":
                    advance();
            }
        }
    };

    var parseName = function() {
	var startPos = pos;
	if (!tryNameStartChar())
	    error("syntax");
	while (tryNameChar())
	    ;
	return source.slice(startPos, pos);
    };

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
            if (codePoint < 0x7F) {
                if (codePoint < " ") {
                    if (codePoint !== "\n" && codePoint !== "\t")
                        error("c0ControlCharRef", hexNumber);
                }
            }
            else if (codePoint >= 0xD800) {
                if (codePoint >= 0x10000) {
                    if (codePoint > 0x10FFFF)
                        error("codePointTooBig", hexNumber);
                    if ((codePoint & 0xFFFE) === 0xFFFE)
                        error("nonCharacterCharRef", hexNumber);
                    codePoint -= 0x10000;
                    return String.fromCharCode((codePoint >> 10) | 0xD800, (codePoint & 0x3FF) | 0xDC00);
                }
                if (codePoint <= 0xDFFF)
                    error("surrogateCharRef", hexNumber);
                if (codePoint >= 0xFDD0 && (codePoint <= 0xFDEF || codePoint >= 0xFFFE))
                    error("nonCharacterCharRef", hexNumber);
            }
            else if (codePoint <= 0x9F)
                error("c1ControlCharRef", hexNumber);
            return String.fromCharCode(codePoint);
        }
        else {
            var name = parseName();
            expect(";");
            var ch = charNames[name];
            if (typeof(ch) != "string")
                error("badCharName", name);
            return ch;
        }
    };

   /* precondition: curChar > ">"
       post: curChar <= ">" */
    var parseSafeChars = function() {
        var startPos = pos;
        do {
            if (curChar >= "\u007F") {
                if (curChar <= "\u009F")
                    error("controlChar");
                if (curChar >= "\uD800") {
                    if (curChar <= "\uDFFF") {
                        if (curChar >= "\uDC00" || pos + 1 === source.length)
                            error("invalidSurrogatePair");
                        var code2 = source.charCodeAt(pos + 1);
                        if (code2 < 0xDC00 || code2 > 0xDFFF)
                            error("invalidSurrogatePair");
                        if ((code2 & 0x3FE) === 0x3FE) {
                            var code1 = curChar.charCodeAt(0);
                            if ((code1 & 0x3F) === 0x3F)
                                error("nonCharacter");
                        }
                        advance();
                    }
                    else if (curChar >= "\uFDD0" && (curChar <= "\uFDEF" || curChar >= "\uFFFE"))
                        error("nonCharacter");
                }
            }
            advance();
        } while (curChar > ">");
        return source.slice(startPos, pos);
    };

    /* current char is whitespace before attribute;
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
        for (;;) {
            if (curChar > ">")
                value += parseSafeChars();
            if (curChar === quote) {
                advance();
                break;
            }
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
                    if (curChar < " ")
                        error("controlChar");
                /* fall through */
                case "\n":
                case "\t":
                    value += curChar;
                    advance();
                    break;
            }
        }
        if (name === "__proto__")
            Object.defineProperty(attributeMap, name,
                {value: value, enumerable: true, writable:true, configurable:true});
        else
	    attributeMap[name] = value;
	return true;
    };

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
            if (curChar > ">")
                text += parseSafeChars();
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
                    else if (tryChar("!")) {
                        parseComment();
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
                    if (curChar < " ")
                        error("controlChar");
                /* fall through */
                case "\n":
                case "\t":
                    text += curChar;
                    advance();
                    break;
            }
	}
    };
    
    return parseDocument();
};


var MicroXML = { };

MicroXML.ParseError = function (source, startPosition, endPosition, message, args) {
    "use strict";
    this.source = source;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.message = this.subst(message, args);
    this.rawMessage = message;
    this.args = args;
};

MicroXML.ParseError.prototype = new SyntaxError();
MicroXML.ParseError.prototype.constructor = MicroXML.ParseError;

MicroXML.ParseError.prototype.subst = function subst(str, args) {
    "use strict";
    var res = "";
    var start = 0;
    for (;;) {
        var i = str.indexOf('%', start);
        if (i < 0) {
            if (start === 0)
                return str;
            res += str.slice(start);
            break;
        }
        res += str.slice(start, i);
        var ch = str.charAt(i + 1);
        if (ch === "") {
            res += "%";
            break;
        }
        if (ch >= "1" && ch <= "9") {
            var argIndex = ch.charCodeAt(0) - "0".charCodeAt(0) - 1;
            if (argIndex < args.length) {
                res += args[argIndex];
            }
        }
        else {
            res += "%";
            if (ch !== "%") {
                res += ch;
            }
        }
        start = i + 2;
    }
    return res;
};

MicroXML.parse = function (source) {
    "use strict";
    var pos = 0;
    var curChar = source.charAt(0);

    function error(template) {
        var args = [];
        var i;
        for (i = 1; i < arguments.length; ++i)
            args.push(arguments[i]);
        throw new MicroXML.ParseError(source, pos, pos === source.length ? pos : pos + 1, template, args);
    }

    // Report an error with an explicit associated position.
    function posError(startPos, endPos, template) {
        var args = [];
        var i;
        for (i = 3; i < arguments.length; ++i)
            args.push(arguments[i]);
        throw new MicroXML.ParseError(source, startPos, endPos, template, args);
    }

    function formatCodePoint(ch) {
        return ch.charCodeAt(0).toString(16).toUpperCase();
    }

    function advance() {
	curChar = source.charAt(++pos);
    }

    function expect(ch) {
        if (curChar !== ch)
            error("expected \"%1\"", ch);
        advance();
    }

    function tryChar(ch) {
        if (curChar === ch) {
            advance();
            return true;
        }
        return false;
    }

    function tryS() {
        if (curChar === ' ' || curChar === '\r' || curChar === '\n' || curChar === '\t') {
            advance();
            return true;
        }
        return false;
    }

    /* These regexes don't include surrogates; we handle these separately. */
    var nameStartCharRegexp = /^[A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/;
    var nameCharRegexp = /^[A-Za-z_0-9.\-\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]$/;

    function tryNameStartChar() {
        if (nameStartCharRegexp.test(curChar)) {
            advance();
            return true;
        }
        return tryNameSurrogate();
    }

    function tryNameChar() {
        if (nameCharRegexp.test(curChar)) {
            advance();
            return true;
        }
        return tryNameSurrogate();
    }

    function tryNameSurrogate() {
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
    }

    function parseDocument() {
        var result;
        if (curChar === "\uFEFF")
            advance();
        for (;;) {
            while (tryS()) {}
            expect("<");
            if (curChar !== "!")
                break;
            advance();
            parseComment();
        }
        result = parseElement();
        for (;;) {
            while (tryS()) {}
            if (curChar === "")
                return result;
            if (curChar !== "<")
                break;
            advance();
            if (!tryChar("!"))
                break;
            parseComment();
        }
        error("only comments and white space are allowed after the document element");
        return result;
    }

    /* precondition: current char is after "!"
     postcondition: current char is after closing ">"
     */
    function parseComment() {
        expect("-");
        expect("-");
        for (;;) {
            if (curChar > ">")
                parseSafeChars();
            switch (curChar) {
                case "":
                    error("missing comment close \"-->\"");
                    break;
                case "-":
                    advance();
                    if (tryChar("-")) {
                        expect(">");
                        return;
                    }
                    break;
                case "\n":
                case "\r":
                case "\t":
                    advance();
                    break;
                default:
                    if (curChar < " ")
                        error("control character #x%1 not allowed", formatCodePoint(curChar));
                    advance();
                    break;
            }
        }
    }

    function parseName() {
        var startPos = pos;
        if (!tryNameStartChar())
            error("invalid name start character");
        while (tryNameChar()) {}
        return source.slice(startPos, pos);
    }

    var hexCharRegexp = /^[a-fA-F0-9]$/;
    var charNames = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'"};

    function parseCharRef() {
        if (tryChar("#")) {
            expect("x");
            var startPos = pos;
            while (hexCharRegexp.test(curChar))
                advance();
            var hexNumber = source.slice(startPos, pos);
            expect(";");
            var charRefError = function (template) {
                posError(startPos, pos - 1, template, hexNumber);
            };
            var codePoint = parseInt(hexNumber, 16);
            if (codePoint < 0x7F) {
                if (codePoint < 0x20) {
                    if (codePoint !== 0xA && codePoint !== 0x9)
                        charRefError("reference to control character #x%1 not allowed");
                }
            }
            else if (codePoint >= 0xD800) {
                if (codePoint >= 0x10000) {
                    if (codePoint > 0x10FFFF)
                        charRefError("character number #x%1 not allowed: greater than #x10FFF");
                    if ((codePoint & 0xFFFE) === 0xFFFE)
                        charRefError("reference to noncharacter code point #x%1 not allowed");
                    codePoint -= 0x10000;
                    return String.fromCharCode((codePoint >> 10) | 0xD800, (codePoint & 0x3FF) | 0xDC00);
                }
                if (codePoint <= 0xDFFF)
                    charRefError("reference to surrogate code point #x%1 now allowed");
                if (codePoint >= 0xFDD0 && (codePoint <= 0xFDEF || codePoint >= 0xFFFE))
                    charRefError("reference to noncharacter code point #x%1 not allowed");
            }
            else if (codePoint <= 0x9F)
                charRefError("reference to C1 control character #x%1 not allowed");
            return String.fromCharCode(codePoint);
        }
        else {
            var name = parseName();
            expect(";");
            var ch = charNames[name];
            if (typeof(ch) !== "string")
                posError(pos - name.length - 1, pos - 1, "unknown character name \"%1\"", name);
            return ch;
        }
    }

    /* precondition: curChar > ">"
     post: curChar <= ">" */
    function parseSafeChars() {
        var startPos = pos;
        do {
            if (curChar >= "\u007F") {
                if (curChar <= "\u009F")
                    error("control character #x%1 not allowed", formatCodePoint(curChar));
                if (curChar >= "\uD800") {
                    if (curChar <= "\uDFFF") {
                        if (curChar >= "\uDC00")
                            error("high surrogate code point #x%1 not following low surrogate", formatCodePoint(curChar));
                        if (pos + 1 === source.length)
                            error("incomplete surrogate pair");
                        var code2 = source.charCodeAt(pos + 1);
                        if (code2 < 0xDC00 || code2 > 0xDFFF)
                            posError(pos + 1, pos + 2, "expected high surrogate code point not #x%1", formatCodePoint(curChar));
                        if ((code2 & 0x3FE) === 0x3FE) {
                            var code1 = curChar.charCodeAt(0);
                            if ((code1 & 0x3F) === 0x3F)
                                posError(pos, pos + 1, "noncharacter code point");
                        }
                        advance();
                    }
                    else if (curChar >= "\uFDD0" && (curChar <= "\uFDEF" || curChar >= "\uFFFE"))
                        error("noncharacter #x%1 not allowed", formatCodePoint(curChar));
                }
            }
            advance();
        } while (curChar > ">");
        return source.slice(startPos, pos);
    }

    /* current char is whitespace before attribute;
     return true if attribute was parsed */
    function tryParseAttribute(attributeMap) {
        if (!tryS())
            return false;
        while (tryS()) {}
        var startPos = pos;
        if (!tryNameStartChar())
            return false;
        while (tryNameChar()) {}
        var name = source.slice(startPos, pos);
        // Give the error has early as possible so that the position is correct
        // The typeof test is to work around a bug in SpiderMonkey 1.8.5 where ({}).hasOwnProperty("__proto__") == true
        if (attributeMap.hasOwnProperty(name) && typeof(attributeMap[name]) === "string")
            posError(startPos, pos, "duplicate attribute \"%1\"", name);
        if (name === "xmlns")
            posError(startPos, pos, "\"xmlns\" is not allowed as an attribute name");
        while (tryS()) {}
        expect("=");
        while (tryS()) {}
        if (curChar !== '"' && curChar !== "'")
            error("attribute value is missing opening quote");
        var quote = curChar;
        var quotePos = pos;
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
                    posError(quotePos, pos, "attribute value without closing quote");
                    break;
                case "<":
                    error("\"<\" in attribute value (missing closing quote?)");
                    break;
                case ">":
                    error("\">\" characters must always be escaped, including in attribute values");
                    break;
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
                case "\n":
                case "\t":
                    value += curChar;
                    advance();
                    break;
                default:
                    if (curChar < " ")
                        error("control character #x%1 not allowed", formatCodePoint(curChar));
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
    }

    /* precondition: current char is character after "<";
     postcondition: current char is character after ">"
     returns data model for element */

    function parseElement() {
        var name = parseName();
        var content = [];
        var attributeMap = { };
        var text = "";

        while (tryParseAttribute(attributeMap)) {}

        if (tryChar("/")) {
            expect(">");
            return [name, attributeMap, content];
        }
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
                            posError(pos - endName.length, pos, "name \"%2\" in end-tag does not match name \"%1\" in start-tag", name, endName);
                        while (tryS()) {}
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
                    error("\">\" characters must always be escaped");
                    break;
                case "":
                    error("missing end-tag \"%1\"", name);
                    break;
                case "\n":
                case "\t":
                    text += curChar;
                    advance();
                    break;
                default:
                    if (curChar < " ")
                        error("control character #x%1 not allowed", formatCodePoint(curChar));
                    text += curChar;
                    advance();
                    break;
            }
        }
    }

    return parseDocument();
};

// This tries to make things work properly when running as a CommonJS module (e.g. under node.js),
// or running at the top-level.

(function() {
    // This must not be in strict mode, because we are using this to access the global object.
    var p;
    // If the variable declaration of MicroXML above didn't set a property on the global object,
    // and there is an in-scope exports variable, then add the MicroXML properties to exports.
    if (this.MicroXML !== MicroXML && typeof(exports) !== "undefined") {
        for (p in MicroXML) {
            if (MicroXML.hasOwnProperty(p)) {
                exports[p] = MicroXML[p];
            }
        }
    }
})();


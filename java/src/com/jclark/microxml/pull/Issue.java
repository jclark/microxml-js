package com.jclark.microxml.pull;

import java.util.Arrays;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public class Issue {
    private Location location;
    private String template;
    private String[] args;

    public Issue(Location location, String template, String[] args) {
        this.location = location;
        this.template = template;
        this.args = Arrays.copyOf(args, args.length, String[].class);
    }

    public Location getLocation() {
        return location;
    }

    public String getMessage() {
        return substitute(template, args);
    }

    public String getTemplate() {
        return template;
    }

    public String[] getArgs() {
        return args;
    }

    static public String substitute(String template, String[] args) {
        StringBuilder res = new StringBuilder();
        int start = 0;
        for (;;) {
            int i = template.indexOf('%', start);
            if (i < 0) {
                if (start == 0)
                    return template;
                res.append(template, start, template.length());
                break;
            }
            res.append(template, start, i);
            if (i + 1 == template.length()) {
                res.append('%');
                break;
            }
            char ch = template.charAt(i + 1);
            if (ch >= '1' && ch <= '9') {
                int argIndex = ch - '1';
                if (argIndex < args.length) {
                    res.append(args[argIndex]);
                }
            }
            else {
                res.append('%');
                if (ch != '%') {
                    res.append(ch);
                }
            }
            start = i + 2;
        }
        return res.toString();
    }
}

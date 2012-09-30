package com.jclark.microxml;

import java.util.Collections;
import java.util.List;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public class Issue {
    private Location location;
    private String message;
    private String template;
    private List<String> args;

    public Issue(Location location, String message, String template, List<String> args) {
        this.location = location;
        this.message = message;
        this.template = template;
        this.args = Collections.unmodifiableList(args);
    }

    public Location getLocation() {
        return location;
    }

    public String getMessage() {
        return message;
    }

    public String getTemplate() {
        return template;
    }

    public List<String> getArgs() {
        return args;
    }

    static String substitute(String template, List<String> args) {
        // TODO implement
        return template;
    }
}

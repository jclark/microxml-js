package com.jclark.microxml.pull;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public class ParseException extends Exception {
    private final Issue issue;

    ParseException(Issue issue) {
        super(issue.getMessage());
        this.issue = issue;
    }

    public Issue getIssue() {
        return issue;
    }
}

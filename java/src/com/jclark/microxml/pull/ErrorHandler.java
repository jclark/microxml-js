package com.jclark.microxml.pull;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public interface ErrorHandler {
    void error(@NotNull Issue issue) throws IOException, ParseException;
}

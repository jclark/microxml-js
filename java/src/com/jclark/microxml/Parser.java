package com.jclark.microxml;

import org.jetbrains.annotations.NotNull;

import java.io.IOException;

/**
 *
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public abstract class Parser {
    private Event event = null;
    private ErrorHandler errorHandler = null;

    public abstract boolean advance() throws IOException, ParseException;

    @NotNull
    public final Event getEvent() {
        if (event == null)
            throw new IllegalStateException();
        return event;
    }

    public void setErrorHandler(ErrorHandler eh) {
        this.errorHandler = eh;
    }

    public ErrorHandler getErrorHandler() {
        return errorHandler;
    }

}
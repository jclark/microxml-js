package com.jclark.microxml;

import org.jetbrains.annotations.NotNull;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public abstract class Event {
    public static enum Type {
         START_ELEMENT, END_ELEMENT, TEXT
    }

    @NotNull
    public abstract Type getType();

    public String getName() {
        return null;
    }

    public String getText() {
        return null;
    }

    public Attributes getAttributes() {
        return null;
    }

    @NotNull
    public abstract Location getLocation();
}

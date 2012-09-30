package com.jclark.microxml;

import org.jetbrains.annotations.NotNull;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public class EndElementEvent extends Event {
    @NotNull
    private String name;
    @NotNull
    private Location location;

    public EndElementEvent(@NotNull String name, @NotNull Location location) {
        this.name = name;
        this.location = location;
    }

    @Override
    @NotNull
    public Type getType() {
        return Type.END_ELEMENT;
    }

    @Override
    @NotNull
    public String getName() {
        return name;
    }

    @NotNull
    @Override
    public Location getLocation() {
        return location;
    }
}

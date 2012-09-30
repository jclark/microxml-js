package com.jclark.microxml;

import org.jetbrains.annotations.NotNull;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public class StartElementEvent extends Event {
    @NotNull
    private String name;
    @NotNull
    private Attributes attributes;
    @NotNull
    private Location location;

    public StartElementEvent(@NotNull String name, @NotNull Attributes attributes, @NotNull Location location) {
        this.name = name;
        this.attributes = attributes;
        this.location = location;
    }

    @Override
    @NotNull
    public String getName() {
        return name;
    }

    @Override
    @NotNull
    public Attributes getAttributes() {
        return this.attributes;
    }

    @Override
    @NotNull
    public Type getType() {
        return Type.START_ELEMENT;
    }

    @Override
    @NotNull
    public Location getLocation() {
        return location;
    }
}

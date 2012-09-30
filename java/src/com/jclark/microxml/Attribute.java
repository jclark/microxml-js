package com.jclark.microxml;

import org.jetbrains.annotations.NotNull;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public class Attribute {
    @NotNull
    private final String name;

    @NotNull
    private String value;

    @NotNull
    private Location location;

    @NotNull
    private PositionMap valuePositionMap;

    public Attribute(@NotNull String name, @NotNull String value,
                     @NotNull Location location, @NotNull PositionMap valuePositionMap) {
        this.name = name;
        this.value = value;
        this.location = location;
        this.valuePositionMap = valuePositionMap;
    }

    @NotNull
    public String getName() {
        return name;
    }

    @NotNull
    public String getValue() {
        return value;
    }

    /**
     * Returns the location of the markup for the attribute.
     * The location starts with the first character of the attribute name and ends with the closing quote of the
     * attribute value.
     * @return the location of the attribute
     */
    @NotNull
    public Location getLocation() {
        return location;
    }

    /**
     * Returns a PositionMap for the attribute value.
     * @return a PositionMap for the attribute value
     */
    @NotNull
    public PositionMap getValuePositionMap() {
        return valuePositionMap;
    }
    /**
     * Set the attribute's value.
     * @param value a String giving the new value
     * @return the previous value
     */
    @NotNull
    public String setValue(@NotNull String value) {
        String temp = this.value;
        this.value = value;
        return temp;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Attribute attribute = (Attribute)o;
        return name.equals(attribute.name) && value.equals(attribute.value);

    }

    @Override
    public int hashCode() {
        return 31 * name.hashCode() + value.hashCode();
    }
}

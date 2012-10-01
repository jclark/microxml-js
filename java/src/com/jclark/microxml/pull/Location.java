package com.jclark.microxml.pull;

import org.jetbrains.annotations.NotNull;

/**
 * Locates a range of characters in the source MicroXML.
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public final class Location {
    @NotNull
    Position startPosition;
    int length;

    public Location(@NotNull Position startPosition, int length) {
        this.startPosition = startPosition;
        this.length = length;
    }

    /**
     * Returns the position of the start of the range.
     * @return
     */
    @NotNull
    public Position getStartPosition() {
        return startPosition;
    }

    /**
      * Returns the length of the range.
      * The length is measured in <code>char</code>s (code units), not code points.
      * The length may be zero.
      * -1 means the length is not available
      * @return an int giving the length of the range
      */
     public int getLength() {
         return length;
     }

}

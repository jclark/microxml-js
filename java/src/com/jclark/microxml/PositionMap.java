package com.jclark.microxml;

import org.jetbrains.annotations.NotNull;

/**
 * Maps from an index in a parsed string back to a source position.
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public abstract class PositionMap {
    /**
     * Returns the source location for a range of parsed string.
     * @param dstIndex the index in the parsed string, between 0 and N, where N is the length of the parsed string
     * @return  the corresponding source position
     */
    @NotNull
    public abstract Position getSourcePosition(int dstIndex);

    public long getSourceIndex(int dstIndex) {
        return getSourcePosition(dstIndex).getIndex();
    }
}

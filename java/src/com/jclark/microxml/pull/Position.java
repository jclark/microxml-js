package com.jclark.microxml.pull;

/**
 * Represents a position in the source document.
 * Positions are conceptually between characters.
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public final class Position {
     private final long index;
     private final int lineNumber;
     private final int columnNumber;

     public Position() {
         index = -1;
         lineNumber = -1;
         columnNumber = -1;
     }

    /**
     * Returns the  index of position.
     * The index is zero-based and measured in <code>char</code>s (code units), not code points.
     * -1 means the index is not available
     * @return a long giving the index of the position
     */
    public long getIndex() {
        return index;
    }

    /**
     * Returns the line number of the start of the range.
     * The first line is line number 1.
     * -1 means the line number is not available.
     * @return an int giving the line number of the position
     */
    public int getLineNumber() {
        return lineNumber;
    }

    /**
     * Returns the column number of the position.
     * The column number is zero-based and measured in <code>char</code>s (code units), not code points.
     * Tab characters are counted the same as any other character.
     * -1 means the column number is not available.
     * @return an int giving the column number of the position
     */
    public int getColumnNumber() {
        return columnNumber;
    }
}

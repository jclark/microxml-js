package com.jclark.microxml.pull;

import org.jetbrains.annotations.NotNull;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public class TextEvent extends Event {
    @NotNull
    private String text;
    @NotNull
    private PositionMap positionMap;

    public TextEvent(@NotNull String text, @NotNull PositionMap positionMap) {
        this.text = text;
        this.positionMap = positionMap;
    }

    @Override
    @NotNull
    public String getText() {
        return text;
    }

    @Override
    @NotNull
    public Type getType() {
        return Type.TEXT;
    }

    @Override
    @NotNull
    public Location getLocation() {
        Position startPosition = positionMap.getSourcePosition(0);
        long length = positionMap.getSourceIndex(text.length()) - startPosition.getIndex();
        if (length > Integer.MAX_VALUE)
            length = Integer.MAX_VALUE;
        return new Location(startPosition, (int)length);
    }
}

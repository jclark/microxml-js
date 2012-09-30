package com.jclark.microxml;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.util.Iterator;
import java.util.TreeMap;

/**
 * @author <a href="mailto:jjc@jclark.com">James Clark</a>
 */
public class Attributes implements Iterable<Attribute> {

    @NotNull
    private TreeMap<String,Attribute> map;

    public Attributes() {
        map = new TreeMap<String,Attribute>();
    }

    @NotNull
    public Iterator<Attribute> iterator() {
        return map.values().iterator();
    }

    public int size() {
        return map.size();
    }

    public boolean isEmpty() {
        return map.isEmpty();
    }

    public void clear() {
        map.clear();
    }

    /**
     * Adds an attribute.
     * @param att an Attribute to add to the put
     * @return the attribute in the attribute list that had the same name as <code>a</code>
     */
    @Nullable
    public Attribute add(@NotNull Attribute att) {
        return map.put(att.getName(), att);
    }

    @Nullable
    public Attribute remove(String name) {
        return map.remove(name);
    }


}

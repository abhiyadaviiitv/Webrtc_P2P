package p2p.webrtc.model;

import java.util.HashSet;
import java.util.Set;

import lombok.Data;

@Data
public class Room {
    private String id;
    private Set<String> participants = new HashSet<>();

    public Room(String id) {
        this.id = id;
    }
}
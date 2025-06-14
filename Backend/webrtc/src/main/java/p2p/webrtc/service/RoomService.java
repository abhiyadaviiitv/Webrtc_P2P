package p2p.webrtc.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import p2p.webrtc.Dto.RoomResponse;
import p2p.webrtc.model.Room;

@Service
public class RoomService {

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    public RoomResponse createRoom() {
        String roomId = UUID.randomUUID().toString().substring(0, 8);
        Room room = new Room(roomId);
        rooms.put(roomId, room);
        return new RoomResponse(roomId);
    }

    public boolean roomExists(String roomId) {
        return rooms.containsKey(roomId);
    }
}
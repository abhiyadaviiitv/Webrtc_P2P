package p2p.webrtc.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import p2p.webrtc.Dto.RoomResponse;
import p2p.webrtc.service.RoomService;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/rooms")
public class RoomController {
     private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PostMapping("/createroom")
    public ResponseEntity<RoomResponse> createRoom() {
        System.out.println("Creating new room \n\n\n\n");
        return ResponseEntity.ok(roomService.createRoom());
    }

    @GetMapping("/{roomId}/exists")
    public ResponseEntity<Boolean> roomExists(@PathVariable String roomId) {
        return ResponseEntity.ok(roomService.roomExists(roomId));
    }

}

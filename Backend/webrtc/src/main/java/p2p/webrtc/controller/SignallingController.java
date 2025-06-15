package p2p.webrtc.controller;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

import p2p.webrtc.model.SignalMessage;

@RestController
public class SignallingController {
    @MessageMapping("/signal/{roomId}")
    @SendTo("/topic/videocall/signal/{roomId}")
    public SignalMessage handleSignal(
        @DestinationVariable String roomId, 
        SignalMessage message
    ) {
        return message;
    }
}

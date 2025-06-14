package p2p.webrtc.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SignalMessage {
    private String type; // "offer", "answer", "candidate"
    private String sender;
    private Object payload;
}

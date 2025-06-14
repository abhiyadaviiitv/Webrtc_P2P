export const createPeerConnection = (
  localStream: MediaStream,
  onRemoteStream: (stream: MediaStream) => void
): RTCPeerConnection => {
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    //  {
    //     urls: 'relay1.expressturn.com:3480', // Your TURN server URL
    //     username: 'efPVTROUWWJ55A39IT',              // TURN username
    //     credential: 'yP21Uvqy20rU7Zgj',            // TURN credential
    //     credentialType: 'password'              // Authentication type
    //   },
    
    ]
  };

  const pc = new RTCPeerConnection(configuration);

  // Add local stream tracks
  localStream.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  // Handle remote stream
  pc.ontrack = (event) => {
    onRemoteStream(event.streams[0]);
  };

  return pc;
};

export const handleOffer = async (pc: RTCPeerConnection, offer: RTCSessionDescriptionInit) => {
  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
};

export const handleAnswer = async (pc: RTCPeerConnection, answer: RTCSessionDescriptionInit) => {
  await pc.setRemoteDescription(new RTCSessionDescription(answer));
};

export const handleCandidate = async (pc: RTCPeerConnection, candidate: RTCIceCandidateInit) => {
  await pc.addIceCandidate(new RTCIceCandidate(candidate));
};
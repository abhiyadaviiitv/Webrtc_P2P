// export const createPeerConnection = (
//   localStream: MediaStream,
//   onRemoteStream: (stream: MediaStream) => void
// ): RTCPeerConnection => {
//   const configuration = {
//     iceServers: [
//       { urls: 'stun:stun.l.google.com:19302' },
//     //  {
//     //     urls: 'relay1.expressturn.com:3480', // Your TURN server URL
//     //     username: 'efPVTROUWWJ55A39IT',              // TURN username
//     //     credential: 'yP21Uvqy20rU7Zgj',            // TURN credential
//     //     credentialType: 'password'              // Authentication type
//     //   },

//     ]
//   };

//   const pc = new RTCPeerConnection(configuration);

//   // Add local stream tracks
//   localStream.getTracks().forEach(track => {
//     pc.addTrack(track, localStream);
//   });

//   // Handle remote stream
//   pc.ontrack = (event) => {
//     onRemoteStream(event.streams[0]);
//   };

//   return pc;
// };

// export const handleOffer = async (pc: RTCPeerConnection, offer: RTCSessionDescriptionInit) => {
//   await pc.setRemoteDescription(new RTCSessionDescription(offer));
//   const answer = await pc.createAnswer();
//   await pc.setLocalDescription(answer);
//   return answer;
// };

// export const handleAnswer = async (pc: RTCPeerConnection, answer: RTCSessionDescriptionInit) => {
//   await pc.setRemoteDescription(new RTCSessionDescription(answer));
// };

// export const handleCandidate = async (pc: RTCPeerConnection, candidate: RTCIceCandidateInit) => {
//   await pc.addIceCandidate(new RTCIceCandidate(candidate));
// };

/**
 * Creates a new RTCPeerConnection with proper configuration
 * @param localStream - Local media stream
 * @param onRemoteStream - Callback when remote stream is received
 * @param onIceCandidate - Callback when ICE candidate is generated
 * @returns Configured RTCPeerConnection
 */
export const createPeerConnection = (
  localStream: MediaStream,
  onRemoteStream: (stream: MediaStream) => void,
  onIceCandidate: (candidate: RTCIceCandidate) => void
): RTCPeerConnection => {
  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }, // Free STUN server
      // Add TURN servers here if needed for NAT traversal
      {
        urls:'turn:relay1.expressturn.com:3480',
        username:'000000002065332507',
        credential:'2dm9ltTqJIjVrRq/LI/QvTm0nPY='
      }
    ],
    iceCandidatePoolSize: 10,
  };

  const pc = new RTCPeerConnection(configuration);

  // Add local stream tracks
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  // Handle remote stream
  pc.ontrack = (event) => {
    if (event.streams && event.streams[0]) {
      onRemoteStream(event.streams[0]);
    }
  };

  // ICE candidate handling
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  // Connection state monitoring
  pc.onconnectionstatechange = () => {
    console.log('Connection state:', pc.connectionState);
  };

  return pc;
};

/**
 * Handles incoming offer and creates answer
 * @param pc - RTCPeerConnection instance
 * @param offer - Received offer SDP
 * @returns Promise with answer SDP
 */
export const handleOffer = async (
  pc: RTCPeerConnection,
  offer: RTCSessionDescriptionInit
): Promise<RTCSessionDescriptionInit> => {
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  } catch (error) {
    console.error('Error handling offer:', error);
    throw error;
  }
};

/**
 * Handles incoming answer
 * @param pc - RTCPeerConnection instance
 * @param answer - Received answer SDP
 */
export const handleAnswer = async (
  pc: RTCPeerConnection,
  answer: RTCSessionDescriptionInit
): Promise<void> => {
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  } catch (error) {
    console.error('Error handling answer:', error);
    throw error;
  }
};

/**
 * Handles incoming ICE candidate
 * @param pc - RTCPeerConnection instance
 * @param candidate - Received ICE candidate
 */
export const handleCandidate = async (
  pc: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> => {
  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
  }
};
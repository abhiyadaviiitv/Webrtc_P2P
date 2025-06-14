/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, type FC } from 'react';
import { createRoom, joinRoom } from '../service/signalingService';
import { createPeerConnection, handleAnswer, handleCandidate, handleOffer } from '../service/webrtcService';
import RoomControls from './RoomControls';
import VideoStream from './VideoStream';



type SignalMessage = {
  type: 'offer' | 'answer' | 'candidate';
  sender: string;
  payload: any;
};

type RoomResponse = {
  roomId: string;
};
const VideoChat: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.error('Failed to get local stream', err);
      }
    };

    init();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSignal = (message: SignalMessage) => {
    if (!peerConnectionRef.current) return;

    switch (message.type) {
      case 'offer':
        handleOffer(peerConnectionRef.current, message.payload)
          .then(answer => {
            // Send answer back through signaling
          });
        break;
      case 'answer':
        handleAnswer(peerConnectionRef.current, message.payload);
        break;
      case 'candidate':
        handleCandidate(peerConnectionRef.current, message.payload);
        break;
    }
  };

  const startCall = async (isCreator: boolean) => {
    const pc = createPeerConnection(localStream!, (stream) => {
      setRemoteStream(stream);
    });
    peerConnectionRef.current = pc;

    if (isCreator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      // Send offer through signaling
    }

    setIsInCall(true);
  };

  return (
    <div className="video-chat">
      <RoomControls
        roomId={roomId}
        setRoomId={setRoomId}
        createRoom={createRoom}
        joinRoom={joinRoom}
        startCall={startCall}
        isInCall={isInCall}
      />
      <div className="video-container">
        <VideoStream stream={localStream} isLocal={true} />
        <VideoStream stream={remoteStream} isLocal={false} />
      </div>
    </div>
  );
};

export default VideoChat;
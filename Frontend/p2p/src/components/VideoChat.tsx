/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import {
  connectToSignaling,
  createRoom,
  disconnect,
  joinRoom,
  sendSignal,
} from '../service/signalingService';
import {
  createPeerConnection,
  handleAnswer,
  handleCandidate,
  handleOffer,
} from '../service/webrtcService';
import RoomControls from './RoomControls';
import VideoStream from './VideoStream';

type SignalMessage = {
  type: 'offer' | 'answer' | 'candidate' | 'join' | 'leave';
  sender: string;
  payload: any;
  target?: string;
};

const VideoChat: React.FC = () => {
  const [roomId, setRoomId] = useState<string>('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [userId] = useState<string>(() => Math.random().toString(36).substring(2, 15));
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const initMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
      } catch (err) {
        console.error('Failed to get local stream', err);
      }
    };

    initMediaStream();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      disconnect();
    };
  }, []);

  const handleSignalMessage = async (message: SignalMessage) => {
    if (message.sender === userId) return;

    if (!peerConnectionRef.current && localStream) {
      const pc = createPeerConnection(
        localStream,
        (stream) => setRemoteStream(stream),
        (candidate) => {
          if (otherUserId) {
            sendSignal(roomId, {
              type: 'candidate',
              sender: userId,
              payload: candidate.toJSON(),
              target: otherUserId,
            });
          }
        }
      );
      peerConnectionRef.current = pc;
    }

    switch (message.type) {
      case 'offer': {
        setOtherUserId(message.sender);
        const answer = await handleOffer(peerConnectionRef.current!, message.payload);
        sendSignal(roomId, {
          type: 'answer',
          sender: userId,
          payload: answer,
          target: message.sender,
        });
        break;
      }
      case 'answer': {
        await handleAnswer(peerConnectionRef.current!, message.payload);
        break;
      }
      case 'candidate': {
        await handleCandidate(peerConnectionRef.current!, message.payload);
        break;
      }
      case 'join': {
        setOtherUserId(message.sender);
        break;
      }
      case 'leave': {
        setRemoteStream(null);
        setOtherUserId(null);
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        break;
      }
    }
  };

  const startCall = async (isCaller: boolean) => {
    if (!localStream) return;

    const pc = createPeerConnection(
      localStream,
      (stream) => setRemoteStream(stream),
      (candidate) => {
        if (otherUserId) {
          sendSignal(roomId, {
            type: 'candidate',
            sender: userId,
            payload: candidate.toJSON(),
            target: otherUserId,
          });
        }
      }
    );
    peerConnectionRef.current = pc;

    if (isCaller && otherUserId) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal(roomId, {
        type: 'offer',
        sender: userId,
        payload: offer,
        target: otherUserId,
      });
    }

    setIsInCall(true);
  };

  useEffect(() => {
    if (!roomId) return;
    connectToSignaling(roomId, userId, handleSignalMessage, (err) => console.error('Signaling error:', err));
    return () => disconnect();
  }, [roomId]);

  return (
    <div className="video-chat">
      <RoomControls
        roomId={roomId}
        setRoomId={setRoomId}
        createRoom={createRoom}
        joinRoom={joinRoom}
        startCall={startCall}
        isInCall={isInCall}
        otherUserId={otherUserId}
      />
      <div className="video-container">
        <VideoStream stream={localStream} isLocal={true} />
        <VideoStream stream={remoteStream} isLocal={false} />
      </div>
    </div>
  );
};

export default VideoChat;

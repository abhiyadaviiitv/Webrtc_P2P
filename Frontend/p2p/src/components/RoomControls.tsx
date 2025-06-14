import React, { useState } from 'react';

interface RoomControlsProps {
  roomId: string;
  setRoomId: (id: string) => void;
  createRoom: () => Promise<string>;
  joinRoom: (roomId: string) => Promise<boolean>;
  startCall: (isCreator: boolean) => void;
  isInCall: boolean;
}

const RoomControls: React.FC<RoomControlsProps> = ({
  roomId,
  setRoomId,
  createRoom,
  joinRoom,
  startCall,
  isInCall
}) => {
  const [error, setError] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError('');
    try {
      const newRoomId = await createRoom();
      setRoomId(newRoomId);
      startCall(true); // Creator initiates the call
    } catch (err) {
      setError('Failed to create room');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID');
      return;
    }

    setIsJoining(true);
    setError('');
    try {
      const exists = await joinRoom(roomId);
      if (exists) {
        startCall(false); // Joiner waits for offer
      } else {
        setError('Room not found');
      }
    } catch (err) {
      setError('Failed to join room');
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="room-controls">
      <div className="control-group">
        <button 
          onClick={handleCreateRoom}
          disabled={isCreating || isInCall}
        >
          {isCreating ? 'Creating...' : 'Create Private Room'}
        </button>
      </div>

      <div className="control-group">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter Room ID"
          disabled={isInCall}
        />
        <button
          onClick={handleJoinRoom}
          disabled={!roomId || isJoining || isInCall}
        >
          {isJoining ? 'Joining...' : 'Join Room'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isInCall && (
        <div className="room-info">
          <p>Room ID: <strong>{roomId}</strong></p>
          <p>Share this ID with others to join</p>
        </div>
      )}
    </div>
  );
};

export default RoomControls;
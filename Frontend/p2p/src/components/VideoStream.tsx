import React, { useEffect, useRef } from 'react';

interface VideoStreamProps {
  stream: MediaStream | null;
  isLocal: boolean;
}

const VideoStream: React.FC<VideoStreamProps> = ({ stream, isLocal }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const handleCanPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error('Error playing video:', e));
    }
  };

  return (
    <div className={`video-stream ${isLocal ? 'local' : 'remote'}`}>
      <video
        ref={videoRef}
        muted={isLocal}
        autoPlay
        playsInline
        onCanPlay={handleCanPlay}
      />
      <div className="video-label">
        {isLocal ? 'You' : 'Remote'}
      </div>
    </div>
  );
};

export default VideoStream;
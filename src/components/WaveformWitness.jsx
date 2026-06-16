import React, { useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioProvider';

const WaveformWitness = ({ waveformData = [], className = '' }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { currentTime, duration, seek } = useAudio();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!canvas || !ctx || !waveformData || waveformData.length === 0) return;

    // Responsive Canvas Resizing
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      drawWaveform();
    };

    const drawWaveform = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = Math.max(1, (canvas.width / waveformData.length) - 1);
      const progressPercent = duration > 0 ? currentTime / duration : 0;
      const progressIndex = Math.floor(progressPercent * waveformData.length);

      waveformData.forEach((amp, idx) => {
        const normalizedAmp = Math.max(0.05, Math.min(1, amp));
        const barHeight = normalizedAmp * canvas.height;
        const x = idx * (canvas.width / waveformData.length);
        const y = canvas.height - barHeight;

        if (idx <= progressIndex) {
          ctx.fillStyle = '#0077b6'; // Primary Container
        } else {
          ctx.fillStyle = '#bfc7d1'; // Outline Variant
        }

        ctx.fillRect(x, y, barWidth, barHeight);
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawWaveform();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [waveformData, currentTime, duration]);

  const handleCanvasClick = (e) => {
    if (duration <= 0) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPercent = x / rect.width;
    seek(clickPercent * duration);
  };

  return (
    <div ref={containerRef} className={`waveform-bar ${className}`} onClick={handleCanvasClick}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
};

export default WaveformWitness;

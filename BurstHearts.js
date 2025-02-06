import React from 'react';
import './BurstHearts.css';

function BurstHearts() {
  const numHearts = 12; // Number of hearts in the burst
  const hearts = Array.from({ length: numHearts }, (_, i) => {
    const angle = (2 * Math.PI / numHearts) * i;
    const distance = 100 + Math.random() * 50; // Distance between 100 and 150px
    const dx = distance * Math.cos(angle);
    const dy = distance * Math.sin(angle);
    const delay = Math.random() * 0.3; // Random delay up to 0.3s
    const duration = 0.8 + Math.random() * 0.5; // Duration between 0.8s and 1.3s
    return { id: i, dx: `${dx}px`, dy: `${dy}px`, delay, duration };
  });

  return (
    <div className="burst-hearts-container">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="burst-heart"
          style={{
            left: "50%",
            top: "50%",
            "--dx": heart.dx,
            "--dy": heart.dy,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`
          }}
        />
      ))}
    </div>
  );
}

export default BurstHearts; 
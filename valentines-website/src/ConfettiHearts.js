import React from 'react';
import './ConfettiHearts.css';

function ConfettiHearts() {
  const numHearts = 12; // Number of hearts in the explosion
  const hearts = Array.from({ length: numHearts }, (_, i) => {
    const angle = (2 * Math.PI / numHearts) * i;
    const distance = 100 + Math.random() * 50; // distance between 100 and 150px
    const dx = distance * Math.cos(angle);
    const dy = distance * Math.sin(angle);
    const delay = Math.random() * 0.3; // random delay up to 0.3s
    const duration = 0.8 + Math.random() * 0.5; // duration between 0.8s and 1.3s
    return { id: i, dx: `${dx}px`, dy: `${dy}px`, delay, duration };
  });

  return (
    <div className="confetti-container">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="confetti-heart"
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

export default ConfettiHearts; 
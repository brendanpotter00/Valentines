import React from 'react';
import './RainingHearts.css';

function RainingHearts() {
  const heartsCount = 20; // Number of raining hearts
  const hearts = Array.from({ length: heartsCount }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 3;
    const duration = 2 + Math.random() * 3;
    return { id: i, left, delay, duration };
  });

  return (
    <div className="raining-hearts-container">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="raining-heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`
          }}
        />
      ))}
    </div>
  );
}

export default RainingHearts; 
import React from 'react';
import './HelloKitty.css';
import helloKittyImage from './assets/hello-kitty.png';

function HelloKitty({ extraJump }) {
  return (
    <div className="hello-kitty-container">
      {/* Ensure you have a pixel art image at public/hello-kitty.png (or adjust the path accordingly) */}
      <img 
        src={helloKittyImage} 
        alt="Hello Kitty" 
        className={`hello-kitty ${extraJump ? 'extra-jump' : ''}`}
      />
    </div>
  );
}

export default HelloKitty; 
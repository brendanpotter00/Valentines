import React from 'react';
import './PixelButton.css';

function PixelButton({ label, onClick, shake }) {
  const className = shake ? 'pixel-button shake' : 'pixel-button';
  return (
    <button className={className} onClick={onClick}>
      {label}
    </button>
  );
}

export default PixelButton; 
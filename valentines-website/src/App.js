// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './Header';
import HelloKitty from './HelloKitty';
import PixelButton from './PixelButton';
import RainingHearts from './RainingHearts';
import BurstHearts from './BurstHearts';
import CursorPixels from './CursorPixels';
import CursorPixelsDesktop from './CursorPixelsDesktop';
import './App.css';

function App() {
  // Array of effect IDs for heart effects.
  const [effects, setEffects] = useState([]);
  const [noButtonShake, setNoButtonShake] = useState(false);
  const [helloExtraJump, setHelloExtraJump] = useState(false);

  // State to track if the app should use the mobile version based on window height.
  const [isMobile, setIsMobile] = useState(window.innerHeight < 1000);
  console.log(isMobile)

  // Update isMobile when the window is resized.
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerHeight < 1000);
    };

    window.addEventListener('resize', handleResize);
    // Cleanup event listener on unmount.
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleYesClick = () => {
    const effectId = Date.now();
    setEffects(prevEffects => [...prevEffects, effectId]);
    
    setHelloExtraJump(true);
    setTimeout(() => {
      setHelloExtraJump(false);
    }, 500);

    setTimeout(() => {
      setEffects(prevEffects => prevEffects.filter(id => id !== effectId));
    }, 8000);
  };

  const handleNoClick = () => {
    if (!noButtonShake) {
      setNoButtonShake(true);
      setEffects([]); // Clear all heart effects.
      setTimeout(() => {
        setNoButtonShake(false);
      }, 500);
    }
  };

  return (
    <div className="App">
      <Header />

      {/* Render the appropriate three.js cursor overlay based on isMobile */}
      {isMobile ? <CursorPixels /> : <CursorPixelsDesktop />}

      {/* Kitty section with Hello Kitty and burst hearts */}
      <div className="kitty-section">
        <HelloKitty extraJump={helloExtraJump} />
        {effects.map(id => (
          <BurstHearts key={`burst_${id}`} />
        ))}
      </div>

      <div className="button-container">
        <PixelButton label="Yes" onClick={handleYesClick} />
        <PixelButton label="No" onClick={handleNoClick} shake={noButtonShake} />
      </div>

      {/* Raining hearts overlay; each effect creates its own overlay */}
      {effects.map(id => (
        <RainingHearts key={`rain_${id}`} />
      ))}
    </div>
  );
}

export default App;

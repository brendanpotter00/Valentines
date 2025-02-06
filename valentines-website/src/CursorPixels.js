// src/CursorPixels.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function CursorPixels() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    
    // Prevent background scrolling on mobile by disabling overflow on body.
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Also, prevent default behavior of touchmove events globally.
    const preventDefault = (e) => e.preventDefault();
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    // Use the full window dimensions for proper mapping.
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Create scene, camera, and renderer with an orthographic camera (pixel-perfect mapping)
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    camera.position.z = 10;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // **********************************************************
    // Create a heart shape using THREE.Shape.
    // The heart is built using Bézier curves.
    const heartShape = new THREE.Shape();
    heartShape.moveTo(5, 5);
    heartShape.bezierCurveTo(5, 5, 4, 0, 0, 0);
    heartShape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
    heartShape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
    heartShape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
    heartShape.bezierCurveTo(16, 7, 16, 0, 10, 0);
    heartShape.bezierCurveTo(7, 0, 5, 5, 5, 5);
    
    // Generate geometry from the shape, center it, and scale it to a reasonable size.
    const geometry = new THREE.ShapeGeometry(heartShape);
    geometry.center();
    geometry.scale(0.5, 0.5, 1);
    
    // Create a red material
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    // Create the main heart mesh that will follow the cursor.
    const heartMesh = new THREE.Mesh(geometry, material);
    // Rotate the heart 180° around Z so it appears right side up.
    heartMesh.rotation.z = Math.PI;
    // On mobile devices, hide the heart until a touch is active.
    if ('ontouchstart' in window) {
      heartMesh.visible = false;
    }
    scene.add(heartMesh);
    // **********************************************************
    
    // For spawning falling hearts when moving fast.
    const fallingHearts = [];
    const gravity = 500; // pixels per second^2

    // Refs to track previous positions for velocity calculation
    const lastMousePosRef = { current: null };
    const lastTouchPosRef = { current: null };

    // -------------------------------
    // Desktop: Mouse events
    // -------------------------------
    const onMouseMove = (e) => {
      // Use window dimensions to compute coordinates:
      // Coordinate system: origin at center, right is positive X, up is positive Y.
      const mouseX = e.clientX - window.innerWidth / 2;
      const mouseY = window.innerHeight / 2 - e.clientY;
      
      // Update the main heart's position.
      heartMesh.position.set(mouseX, mouseY, 0);
      
      const currentTime = performance.now();
      const currentPos = { x: mouseX, y: mouseY, time: currentTime };
      if (lastMousePosRef.current) {
        const dt = (currentTime - lastMousePosRef.current.time) / 1000; // seconds
        if (dt > 0) {
          const dx = currentPos.x - lastMousePosRef.current.x;
          const dy = currentPos.y - lastMousePosRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const velocity = distance / dt; // in pixels per second
          const velocityThreshold = 600; // adjust as needed
          if (velocity > velocityThreshold) {
            // Spawn a falling heart.
            const fallingHeart = new THREE.Mesh(geometry.clone(), material.clone());
            fallingHeart.rotation.z = heartMesh.rotation.z;
            fallingHeart.position.x = currentPos.x;
            fallingHeart.position.y = currentPos.y;
            fallingHeart.scale.set(0.5, 0.5, 0.5);
            scene.add(fallingHeart);
            fallingHearts.push({ mesh: fallingHeart, velocityY: 0 });
          }
        }
      }
      lastMousePosRef.current = currentPos;
    };

    // -------------------------------
    // Mobile: Touch events
    // -------------------------------
    const onTouchStart = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const touchX = touch.clientX - window.innerWidth / 2;
        const touchY = window.innerHeight / 2 - touch.clientY;
        heartMesh.visible = true;
        heartMesh.position.x = touchX;
        heartMesh.position.y = touchY;
        const currentTime = performance.now();
        lastTouchPosRef.current = { x: touchX, y: touchY, time: currentTime };
      }
    };
    
    const onTouchMove = (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const touchX = touch.clientX - window.innerWidth / 2;
        const touchY = window.innerHeight / 2 - touch.clientY;
        heartMesh.position.x = touchX;
        heartMesh.position.y = touchY;
        const currentTime = performance.now();
        const currentPos = { x: touchX, y: touchY, time: currentTime };
        if (lastTouchPosRef.current) {
          const dt = (currentTime - lastTouchPosRef.current.time) / 1000;
          if (dt > 0) {
            const dx = currentPos.x - lastTouchPosRef.current.x;
            const dy = currentPos.y - lastTouchPosRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const velocity = distance / dt;
            const velocityThreshold = 600;
            if (velocity > velocityThreshold) {
              const fallingHeart = new THREE.Mesh(geometry.clone(), material.clone());
              fallingHeart.rotation.z = heartMesh.rotation.z;
              fallingHeart.position.x = currentPos.x;
              fallingHeart.position.y = currentPos.y;
              fallingHeart.scale.set(0.5, 0.5, 0.5);
              scene.add(fallingHeart);
              fallingHearts.push({ mesh: fallingHeart, velocityY: 0 });
            }
          }
        }
        lastTouchPosRef.current = currentPos;
      }
    };

    const onTouchEnd = () => {
      heartMesh.visible = false;
      lastTouchPosRef.current = null;
    };

    // Add event listeners.
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    let lastTime = performance.now();
    // Animation loop.
    const animate = () => {
      const currentTime = performance.now();
      const dt = (currentTime - lastTime) / 1000; // delta time in seconds
      lastTime = currentTime;
      
      // Update falling hearts: apply gravity downward.
      for (let i = fallingHearts.length - 1; i >= 0; i--) {
        const obj = fallingHearts[i];
        obj.velocityY += gravity * dt;
        obj.mesh.position.y -= obj.velocityY * dt;
        // Remove the heart if it moves off the bottom.
        if (obj.mesh.position.y < -height / 2 - 50) {
          scene.remove(obj.mesh);
          fallingHearts.splice(i, 1);
        }
      }
  
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup event listeners and renderer on unmount.
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      document.body.style.overflow = originalBodyOverflow;
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow clicks/touches to pass through.
        zIndex: 1,
      }}
    />
  );
}

export default CursorPixels;

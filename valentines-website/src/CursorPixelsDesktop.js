import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function CursorPixelsDesktop() {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene, camera, and renderer using an orthographic camera (pixel-perfect)
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      width / -2, width / 2,
      height / 2, height / -2,
      1, 1000
    );
    camera.position.z = 10;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // **********************************************************
    // Create a heart shape using THREE.Shape
    // (We build the shape with Bézier curves.)
    const heartShape = new THREE.Shape();
    heartShape.moveTo(5, 5);
    heartShape.bezierCurveTo(5, 5, 4, 0, 0, 0);
    heartShape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
    heartShape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
    heartShape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
    heartShape.bezierCurveTo(16, 7, 16, 0, 10, 0);
    heartShape.bezierCurveTo(7, 0, 5, 5, 5, 5);
    
    // Generate geometry and center it. Scale it down to an appropriate size.
    const geometry = new THREE.ShapeGeometry(heartShape);
    geometry.center();
    geometry.scale(0.5, 0.5, 1);
    
    // Create a red material
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    
    // Create the main heart that follows the cursor.
    const heartMesh = new THREE.Mesh(geometry, material);
    // If the heart appears upside down, rotate it by 180° (about the Z axis) to fix its orientation.
    heartMesh.rotation.z = Math.PI;
    scene.add(heartMesh);
    // **********************************************************
    
    // For spawning falling hearts based on mouse velocity.
    const fallingHearts = [];
    const gravity = 500; // pixels per second^2
    
    // We'll track the previous mouse position and time to compute velocity.
    const lastMousePosRef = { current: null };
    
    // onMouseMove event handler updates the main heart position and spawns falling hearts when the mouse is fast.
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = height / 2 - (e.clientY - rect.top);
      
      // Update the cursor-following heart's position.
      heartMesh.position.x = mouseX;
      heartMesh.position.y = mouseY;
      
      // Compute velocity if we have a previous event.
      const currentTime = performance.now();
      const currentPos = { x: mouseX, y: mouseY, time: currentTime };
      if (lastMousePosRef.current) {
        const dt = (currentTime - lastMousePosRef.current.time) / 1000; // seconds
        if (dt > 0) {
          const dx = currentPos.x - lastMousePosRef.current.x;
          const dy = currentPos.y - lastMousePosRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          // Velocity in pixels per second
          const velocity = distance / dt;
          const velocityThreshold = 600; // adjust this threshold as needed
          if (velocity > velocityThreshold) {
            // Spawn a falling heart at the current mouse position.
            const fallingHeart = new THREE.Mesh(geometry.clone(), material.clone());
            // Ensure it uses the same rotation as the cursor heart.
            fallingHeart.rotation.z = heartMesh.rotation.z;
            fallingHeart.position.x = currentPos.x;
            fallingHeart.position.y = currentPos.y;
            // Optionally, scale falling hearts differently.
            fallingHeart.scale.set(0.5, 0.5, 0.5);
            scene.add(fallingHeart);
            fallingHearts.push({ mesh: fallingHeart, velocityY: 0 });
          }
        }
      }
      lastMousePosRef.current = currentPos;
    };
    
    // Attach mousemove to window since container has pointerEvents: 'none'
    window.addEventListener('mousemove', onMouseMove);
    
    let lastTime = performance.now();
    // Animation loop: render the scene and update falling hearts.
    const animate = () => {
      const currentTime = performance.now();
      const dt = (currentTime - lastTime) / 1000;  // delta time in seconds
      lastTime = currentTime;
      
      // Update falling hearts: accelerate them downward under gravity.
      for (let i = fallingHearts.length - 1; i >= 0; i--) {
        const obj = fallingHearts[i];
        obj.velocityY += gravity * dt;
        // In our coordinate system, falling means decreasing y.
        obj.mesh.position.y -= obj.velocityY * dt;
        // Remove heart if it moves off-screen (below bottom edge)
        if (obj.mesh.position.y < -height / 2 - 50) {
          scene.remove(obj.mesh);
          fallingHearts.splice(i, 1);
        }
      }
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
    
    // Cleanup on component unmount.
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
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
        pointerEvents: 'none', // Allow clicks to pass through.
        zIndex: 1
      }}
    />
  );
}

export default CursorPixelsDesktop;
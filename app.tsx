import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const App: React.FC = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 }); // percentage position
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = () => {
    alert('You caught me! 🎉');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(e.clientX - buttonCenterX, 2) + 
        Math.pow(e.clientY - buttonCenterY, 2)
      );

      const threshold = 150; // pixels

      if (distance < threshold) {
        // Calculate direction away from cursor
        const angle = Math.atan2(
          buttonCenterY - e.clientY,
          buttonCenterX - e.clientX
        );

        // Move button away (larger jump for smoother escape)
        const jumpDistance = 15; // percentage points
        const newX = position.x + Math.cos(angle) * jumpDistance;
        const newY = position.y + Math.sin(angle) * jumpDistance;

        // Keep button within bounds (5% to 95%)
        const clampedX = Math.max(5, Math.min(95, newX));
        const clampedY = Math.max(5, Math.min(95, newY));

        setPosition({ x: clampedX, y: clampedY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [position]);

  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <button 
        ref={buttonRef}
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          transition: 'all 0.15s ease-out',
          whiteSpace: 'nowrap'
        }}
      >
        Click Me
      </button>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

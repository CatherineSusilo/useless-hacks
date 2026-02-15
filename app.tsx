import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

type StickType = 'straight' | 'vertical' | 'T' | 'L' | 'reverseL' | 'circle';

interface InventoryCounts {
  straight: number;
  vertical: number;
  T: number;
  L: number;
  reverseL: number;
  circle: number;
}

interface PlacedStick {
  id: string;
  type: StickType;
  x: number;
  y: number;
  rotation: number;
}

const STICK_WIDTH = 20;
const STICK_LENGTH = 100;

const App: React.FC = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [inventory, setInventory] = useState<InventoryCounts>({
    straight: 5,
    vertical: 5,
    T: 3,
    L: 4,
    reverseL: 4,
    circle: 3
  });
  const [placedSticks, setPlacedSticks] = useState<PlacedStick[]>([]);
  const [draggingStick, setDraggingStick] = useState<StickType | null>(null);
  const [nextId, setNextId] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isShrunken, setIsShrunken] = useState(false);
  const [canShrink, setCanShrink] = useState(true);
  const [isTranslucent, setIsTranslucent] = useState(false);
  const [translucentOpacity, setTranslucentOpacity] = useState(0);
  const [canGoTranslucent, setCanGoTranslucent] = useState(true);
  const [gameMode, setGameMode] = useState<'chase' | 'escape'>('escape'); // escape = user chases button, chase = button chases cursor
  const [showModal, setShowModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleClick = () => {
    setShowModal(true);
  };
  
  const handleClose = () => {
    setShowModal(false);
  };
  
  const handleSwitchRoles = () => {
    setGameMode(gameMode === 'escape' ? 'chase' : 'escape');
    setShowModal(false);
    // Reset abilities
    setIsShrunken(false);
    setIsTranslucent(false);
    setTranslucentOpacity(1);
  };

  const renderStickShape = (type: StickType) => {
    switch (type) {
      case 'straight':
        return (
          <div style={{
            width: `${STICK_LENGTH}px`,
            height: `${STICK_WIDTH}px`,
            backgroundColor: '#8B4513',
            borderRadius: '3px'
          }} />
        );
      case 'vertical':
        return (
          <div style={{
            width: `${STICK_WIDTH}px`,
            height: `${STICK_LENGTH}px`,
            backgroundColor: '#8B4513',
            borderRadius: '3px'
          }} />
        );
      case 'T':
        return (
          <div style={{ position: 'relative', width: `${STICK_LENGTH}px`, height: `${STICK_LENGTH}px` }}>
            <div style={{
              position: 'absolute',
              width: `${STICK_LENGTH}px`,
              height: `${STICK_WIDTH}px`,
              backgroundColor: '#8B4513',
              borderRadius: '3px',
              top: '0',
              left: '0'
            }} />
            <div style={{
              position: 'absolute',
              width: `${STICK_WIDTH}px`,
              height: `${STICK_LENGTH}px`,
              backgroundColor: '#8B4513',
              borderRadius: '3px',
              top: '0',
              left: `${(STICK_LENGTH - STICK_WIDTH) / 2}px`
            }} />
          </div>
        );
      case 'L':
        return (
          <div style={{ position: 'relative', width: `${STICK_LENGTH}px`, height: `${STICK_LENGTH}px` }}>
            <div style={{
              position: 'absolute',
              width: `${STICK_WIDTH}px`,
              height: `${STICK_LENGTH}px`,
              backgroundColor: '#8B4513',
              borderRadius: '3px',
              bottom: '0',
              left: '0'
            }} />
            <div style={{
              position: 'absolute',
              width: `${STICK_LENGTH}px`,
              height: `${STICK_WIDTH}px`,
              backgroundColor: '#8B4513',
              borderRadius: '3px',
              bottom: '0',
              left: '0'
            }} />
          </div>
        );
      case 'reverseL':
        return (
          <div style={{ position: 'relative', width: `${STICK_LENGTH}px`, height: `${STICK_LENGTH}px` }}>
            <div style={{
              position: 'absolute',
              width: `${STICK_WIDTH}px`,
              height: `${STICK_LENGTH}px`,
              backgroundColor: '#8B4513',
              borderRadius: '3px',
              bottom: '0',
              right: '0'
            }} />
            <div style={{
              position: 'absolute',
              width: `${STICK_LENGTH}px`,
              height: `${STICK_WIDTH}px`,
              backgroundColor: '#8B4513',
              borderRadius: '3px',
              bottom: '0',
              right: '0'
            }} />
          </div>
        );
      case 'circle':
        return (
          <div style={{
            width: `${STICK_LENGTH}px`,
            height: `${STICK_LENGTH}px`,
            backgroundColor: '#8B4513',
            borderRadius: '50%'
          }} />
        );
    }
  };

  const handleDragStart = (stickType: StickType, e: React.MouseEvent) => {
    if (inventory[stickType] > 0) {
      setDraggingStick(stickType);
      setDragOffset({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragMove = (e: MouseEvent) => {
    if (draggingStick) {
      setDragOffset({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDragEnd = (e: MouseEvent) => {
    if (draggingStick && e.clientY < window.innerHeight - 100) { // Above inventory bar
      const placed: PlacedStick = {
        id: `stick-${nextId}`,
        type: draggingStick,
        x: e.clientX,
        y: e.clientY,
        rotation: 0
      };
      setPlacedSticks([...placedSticks, placed]);
      setInventory({
        ...inventory,
        [draggingStick]: inventory[draggingStick] - 1
      });
      setNextId(nextId + 1);
    }
    setDraggingStick(null);
  };

  useEffect(() => {
    if (draggingStick) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [draggingStick, inventory, placedSticks, nextId]);

  const checkCollision = (newX: number, newY: number): boolean => {
    if (!buttonRef.current) return false;

    const buttonRect = {
      left: (newX / 100) * window.innerWidth - 50,
      right: (newX / 100) * window.innerWidth + 50,
      top: (newY / 100) * window.innerHeight - 25,
      bottom: (newY / 100) * window.innerHeight + 25
    };

    for (const stick of placedSticks) {
      const stickSize = stick.type === 'straight' ? STICK_LENGTH : STICK_LENGTH;
      const stickRect = {
        left: stick.x - stickSize / 2,
        right: stick.x + stickSize / 2,
        top: stick.y - stickSize / 2,
        bottom: stick.y + stickSize / 2
      };

      if (
        buttonRect.left < stickRect.right &&
        buttonRect.right > stickRect.left &&
        buttonRect.top < stickRect.bottom &&
        buttonRect.bottom > stickRect.top
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Track mouse position for chase mode
      const mouseXPercent = (e.clientX / window.innerWidth) * 100;
      const mouseYPercent = (e.clientY / window.innerHeight) * 100;
      setMousePosition({ x: mouseXPercent, y: mouseYPercent });
      
      if (!buttonRef.current || draggingStick) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;

      const distance = Math.sqrt(
        Math.pow(e.clientX - buttonCenterX, 2) + 
        Math.pow(e.clientY - buttonCenterY, 2)
      );

      const threshold = 150;

      if (gameMode === 'escape' && distance < threshold) {
        // Activate shrink ability if available and user is very close
        if (canShrink && !isShrunken && !isTranslucent && distance < 100) {
          setIsShrunken(true);
          setCanShrink(false);
          
          // Revert shrink after 3 seconds
          setTimeout(() => {
            setIsShrunken(false);
          }, 3000);
          
          // Cooldown of 8 seconds
          setTimeout(() => {
            setCanShrink(true);
          }, 11000); // 3 seconds active + 8 seconds cooldown
        }
        
        // Activate translucent ability if available and at medium distance
        if (canGoTranslucent && !isTranslucent && !isShrunken && distance >= 100 && distance < 130) {
          setIsTranslucent(true);
          setCanGoTranslucent(false);
          setTranslucentOpacity(0);
          
          // Create pulsing effect: 0% most of the time, 15% for 0.2s every 0.8s
          const pulseInterval = setInterval(() => {
            setTranslucentOpacity(0.15);
            setTimeout(() => {
              setTranslucentOpacity(0);
            }, 200);
          }, 800);
          
          // Revert translucent after 4 seconds
          setTimeout(() => {
            clearInterval(pulseInterval);
            setIsTranslucent(false);
            setTranslucentOpacity(1);
          }, 4000);
          
          // Cooldown of 10 seconds
          setTimeout(() => {
            setCanGoTranslucent(true);
          }, 14000); // 4 seconds active + 10 seconds cooldown
        }

        const angle = Math.atan2(
          buttonCenterY - e.clientY,
          buttonCenterX - e.clientX
        );

        const jumpDistance = 15;
        const newX = position.x + Math.cos(angle) * jumpDistance;
        const newY = position.y + Math.sin(angle) * jumpDistance;

        const clampedX = Math.max(5, Math.min(95, newX));
        const clampedY = Math.max(5, Math.min(85, newY));

        // Check if new position collides with any stick
        if (!checkCollision(clampedX, clampedY)) {
          setPosition({ x: clampedX, y: clampedY });
        } else {
          // Try alternative escape directions
          const altAngles = [angle + Math.PI / 4, angle - Math.PI / 4, angle + Math.PI / 2, angle - Math.PI / 2];
          for (const altAngle of altAngles) {
            const altX = position.x + Math.cos(altAngle) * jumpDistance;
            const altY = position.y + Math.sin(altAngle) * jumpDistance;
            const altClampedX = Math.max(5, Math.min(95, altX));
            const altClampedY = Math.max(5, Math.min(85, altY));
            
            if (!checkCollision(altClampedX, altClampedY)) {
              setPosition({ x: altClampedX, y: altClampedY });
              break;
            }
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [position, placedSticks, draggingStick, gameMode, canShrink, isShrunken, canGoTranslucent, isTranslucent, translucentOpacity]);
  
  // Chase mode: button follows cursor
  useEffect(() => {
    if (gameMode === 'chase' && !draggingStick && !showModal) {
      const chaseInterval = setInterval(() => {
        const dx = mousePosition.x - position.x;
        const dy = mousePosition.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if button caught the cursor
        if (distance < 5) {
          setShowModal(true);
          return;
        }
        
        // Move button towards cursor (slower than escape mode)
        const speed = 7; // slower than escape mode
        const newX = position.x + (dx / distance) * speed;
        const newY = position.y + (dy / distance) * speed;
        
        const clampedX = Math.max(5, Math.min(95, newX));
        const clampedY = Math.max(5, Math.min(85, newY));
        
        if (!checkCollision(clampedX, clampedY)) {
          setPosition({ x: clampedX, y: clampedY });
        }
      }, 50);
      
      return () => clearInterval(chaseInterval);
    }
  }, [gameMode, mousePosition, position, draggingStick, placedSticks, showModal]);

  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Inventory Bar */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '670px',
        height: '90px',
        backgroundColor: 'rgba(240, 240, 240, 0.85)',
        border: '2px solid rgba(204, 204, 204, 0.8)',
        borderRadius: '10px',
        display: 'flex',
        gap: '15px',
        padding: '10px 20px',
        alignItems: 'flex-end',
        overflowX: 'auto',
        zIndex: 1000,
        backdropFilter: 'blur(5px)'
      }}>
        {(Object.keys(inventory) as StickType[]).map(stickType => (
          inventory[stickType] > 0 && (
            <div
              key={stickType}
              onMouseDown={(e) => handleDragStart(stickType, e)}
              style={{
                cursor: 'grab',
                padding: '5px',
                display: 'inline-block',
                position: 'relative'
              }}
            >
              <div style={{ transform: 'scale(0.5)', transformOrigin: 'bottom left' }}>
                {renderStickShape(stickType)}
              </div>
              <div style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                x{inventory[stickType]}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Placed Sticks */}
      {placedSticks.map(stick => (
        <div
          key={stick.id}
          style={{
            position: 'absolute',
            left: `${stick.x}px`,
            top: `${stick.y}px`,
            transform: `translate(-50%, -50%) rotate(${stick.rotation}deg)`,
            pointerEvents: 'none'
          }}
        >
          {renderStickShape(stick.type)}
        </div>
      ))}

      {/* Dragging Stick Preview */}
      {draggingStick && (
        <div
          style={{
            position: 'fixed',
            left: `${dragOffset.x}px`,
            top: `${dragOffset.y}px`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            opacity: 0.7,
            zIndex: 999
          }}
        >
          {renderStickShape(draggingStick)}
        </div>
      )}

      {/* Button */}
      <button 
        ref={buttonRef}
        onClick={handleClick}
        style={{
          position: 'absolute',
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) scale(${isShrunken ? 0.4 : 1})`,
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#ff0000',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          transition: 'all 0.15s ease-out',
          whiteSpace: 'nowrap',
          zIndex: 100,
          opacity: isTranslucent ? translucentOpacity : 1
        }}
      >
        Click Me
      </button>
      
      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>
              {gameMode === 'escape' ? 'You caught me! 🎉' : 'I caught you! 😈'}
            </h2>
            <p style={{ marginBottom: '30px', color: '#666' }}>
              Were you that bored? If so, let's do it again
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Close
              </button>
              <button
                onClick={handleSwitchRoles}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                Switch Roles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);

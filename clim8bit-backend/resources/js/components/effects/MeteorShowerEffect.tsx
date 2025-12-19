import { useEffect, useState } from 'react';

interface Meteor {
  id: number;
  left: number;
  top: number;
  delay: number;
  duration: number;
  size: number;
}

interface MeteorShowerEffectProps {
  fadeOut?: boolean; // For scene transitions
}

export function MeteorShowerEffect({ fadeOut = false }: MeteorShowerEffectProps) {
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [meteorIdCounter, setMeteorIdCounter] = useState(0);

  useEffect(() => {
    // Create initial meteors - more visible
    const initialMeteors: Meteor[] = [];
    for (let i = 0; i < 5; i++) {
      initialMeteors.push(createMeteor(i));
    }
    setMeteors(initialMeteors);
    setMeteorIdCounter(5);

    // Periodically add new meteors - more frequently
    const interval = setInterval(() => {
      setMeteorIdCounter(prev => {
        const newId = prev + 1;
        const newMeteor = createMeteor(newId);
        
        setMeteors(current => {
          // Add new meteor
          const updated = [...current, newMeteor];
          
          // Remove meteor after its animation completes
          setTimeout(() => {
            setMeteors(m => m.filter(meteor => meteor.id !== newMeteor.id));
          }, (newMeteor.duration + newMeteor.delay) * 1000);
          
          return updated;
        });
        
        return newId;
      });
    }, 3000 + Math.random() * 4000); // Every 3-7 seconds (more frequent)

    return () => clearInterval(interval);
  }, []);

  const createMeteor = (id: number): Meteor => {
    return {
      id,
      left: Math.random() * 100, // Start anywhere horizontally
      top: Math.random() * 30, // Start in top 30% of screen
      delay: 0, // No delay, start immediately
      duration: 0.3 + Math.random() * 0.3, // 0.3-0.6 seconds (very fast!)
      size: 3 + Math.random() * 2, // 3-5px width
    };
  };

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden z-20"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: fadeOut ? 'opacity 2s ease-out' : 'none',
      }}
    >
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="absolute"
          style={{
            left: `${meteor.left}%`,
            top: `${meteor.top}%`,
            width: `${meteor.size}px`,
            height: '100px', // Very long trail for dramatic effect
            background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.3))',
            transform: 'rotate(45deg)', // Diagonal angle
            animation: `meteorFall ${meteor.duration}s linear forwards`,
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 1))',
            imageRendering: 'pixelated',
          }}
        />
      ))}

      <style>{`
        @keyframes meteorFall {
          0% {
            opacity: 0;
            transform: translateX(0) translateY(0) rotate(45deg);
          }
          2% {
            opacity: 1;
          }
          98% {
            opacity: 0.95;
          }
          100% {
            opacity: 0;
            transform: translateX(-700px) translateY(700px) rotate(45deg);
          }
        }
      `}</style>
    </div>
  );
}
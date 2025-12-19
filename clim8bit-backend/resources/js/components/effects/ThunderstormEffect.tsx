import { useEffect, useState } from 'react';

interface LightningBolt {
  id: number;
  position: number; // 0-100 percentage
  visible: boolean;
}

export function ThunderstormEffect() {
  const [flash, setFlash] = useState(false);
  const [lightningBolts, setLightningBolts] = useState<LightningBolt[]>([]);

  useEffect(() => {
    let boltIdCounter = 0;

    const triggerLightning = () => {
      // Flash effect
      setFlash(true);
      setTimeout(() => setFlash(false), 100);
      
      // Create single lightning bolt at random position
      const newBolt: LightningBolt = {
        id: boltIdCounter++,
        position: Math.random() * 80 + 10, // 10% to 90% to keep it visible
        visible: true,
      };
      
      setLightningBolts(prev => [...prev, newBolt]);
      
      // Remove bolt after GIF animation completes (assuming ~500ms for the GIF)
      setTimeout(() => {
        setLightningBolts(prev => prev.filter(bolt => bolt.id !== newBolt.id));
      }, 500);
    };

    const interval = setInterval(triggerLightning, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {flash && (
        <div className="fixed inset-0 bg-white pointer-events-none z-30 lightning-flash" />
      )}
      
      {/* Lightning bolts using GIF */}
      {lightningBolts.map(bolt => (
        <img
          key={bolt.id}
          src="/assets/images/clouds/lightning.gif"
          alt="Lightning"
          className="fixed top-0 pointer-events-none z-5"
          style={{ 
            left: `${bolt.position}%`,
            transform: 'translateX(-50%)',
            height: '60vh',
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 20px rgba(135, 206, 250, 0.8)) drop-shadow(0 0 30px rgba(135, 206, 250, 0.6))',
          }}
        />
      ))}
    </>
  );
}
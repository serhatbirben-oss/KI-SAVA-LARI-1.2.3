import React, { useEffect, useState } from 'react';

const SnowEffect: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<number[]>([]);

  useEffect(() => {
    // Generate static snowflakes only once to avoid re-renders impacting performance
    const flakes = Array.from({ length: 50 }, (_, i) => i);
    setSnowflakes(flakes);
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {snowflakes.map((i) => {
        const left = Math.random() * 100;
        const duration = Math.random() * 5 + 5; // 5-10s
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.5 + 0.1;
        const size = Math.random() * 0.5 + 0.2; // rem

        return (
          <div
            key={i}
            className="snowflake bg-white rounded-full absolute"
            style={{
              left: `${left}%`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              opacity: opacity,
              width: `${size}rem`,
              height: `${size}rem`,
            }}
          />
        );
      })}
    </div>
  );
};

export default SnowEffect;
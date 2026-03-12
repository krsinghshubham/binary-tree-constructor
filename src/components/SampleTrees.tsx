import React, { useState, useRef, useEffect } from 'react';

const SAMPLES: { label: string; arrayString: string }[] = [
  { label: 'Empty', arrayString: '[]' },
  { label: 'Single node', arrayString: '[1]' },
  { label: 'Small', arrayString: '[1,2,3]' },
  { label: 'Medium', arrayString: '[5,3,6,2,4,null,null,1,null,3]' },
];

interface SampleTreesProps {
  onSelectSample: (arrayString: string) => void;
}

const SampleTrees: React.FC<SampleTreesProps> = ({ onSelectSample }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="config-panel" ref={containerRef}>
      <button
        type="button"
        className="btn btn-settings"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isOpen ? 'Close' : 'Sample trees'}
      </button>
      {isOpen && (
        <div className="config-dropdown" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {SAMPLES.map(({ label, arrayString }) => (
            <button
              key={arrayString}
              type="button"
              className="btn"
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => {
                onSelectSample(arrayString);
                setIsOpen(false);
              }}
            >
              {label} → {arrayString}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SampleTrees;

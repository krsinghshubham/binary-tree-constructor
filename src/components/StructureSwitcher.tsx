import type { StructureKind } from '../types';

interface StructureSwitcherProps {
  value: StructureKind;
  onChange: (mode: StructureKind) => void;
}

const OPTIONS: { id: StructureKind; label: string }[] = [
  { id: 'tree', label: 'Binary tree' },
  { id: 'graph', label: 'Graph' },
];

export function StructureSwitcher({ value, onChange }: StructureSwitcherProps) {
  return (
    <div className="structure-switcher" role="tablist" aria-label="Data structure">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          role="tab"
          aria-selected={value === opt.id}
          className={`structure-switcher-btn${value === opt.id ? ' is-active' : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

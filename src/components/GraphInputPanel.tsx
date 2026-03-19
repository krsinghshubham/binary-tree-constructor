import React, { useState, useEffect, useRef } from 'react';

interface GraphInputPanelProps {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
}

const GraphInputPanel: React.FC<GraphInputPanelProps> = ({ value, onChange, onClear }) => {
  const [localValue, setLocalValue] = useState(value);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocalValue(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(text);
    }, 300);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = localValue;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="input-panel">
      <label className="input-label">Graph (LeetCode JSON or text edge list)</label>
      <p className="graph-input-hint">
        LeetCode: <code>[[0,1],[1,2,5]]</code> or{' '}
        <code>{'{"n":4,"edges":[[0,1],[2,3]]}'}</code>
        <br />
        Text: <code>0-1, 1-2</code> · weighted text: <code>0-1:5</code>
      </p>
      <div className="input-row">
        <input
          type="text"
          className="tree-input"
          value={localValue}
          onChange={handleChange}
          placeholder='[[0,1],[1,2]] or {"n":3,"edges":[[0,1]]}'
          spellCheck={false}
        />
        <button type="button" className="btn btn-copy" onClick={handleCopy} title="Copy to clipboard">
          {copied ? '✓' : 'Copy'}
        </button>
        <button type="button" className="btn btn-clear" onClick={onClear} title="Clear graph">
          Clear
        </button>
      </div>
    </div>
  );
};

export default GraphInputPanel;

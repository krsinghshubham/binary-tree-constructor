import React, { useState, useEffect, useRef } from 'react';

interface InputPanelProps {
  value: string;
  onChange: (text: string) => void;
  onClear: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ value, onChange, onClear }) => {
  const [localValue, setLocalValue] = useState(value);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExternalUpdate = useRef(false);

  useEffect(() => {
    isExternalUpdate.current = true;
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    isExternalUpdate.current = false;
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
      <label className="input-label">Tree Array (BFS)</label>
      <div className="input-row">
        <input
          type="text"
          className="tree-input"
          value={localValue}
          onChange={handleChange}
          placeholder="[1,2,3,null,4,5,6]"
          spellCheck={false}
        />
        <button className="btn btn-copy" onClick={handleCopy} title="Copy to clipboard">
          {copied ? '✓' : 'Copy'}
        </button>
        <button className="btn btn-clear" onClick={onClear} title="Clear tree">
          Clear
        </button>
      </div>
    </div>
  );
};

export default InputPanel;

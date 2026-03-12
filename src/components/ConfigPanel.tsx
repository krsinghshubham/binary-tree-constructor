import React, { useState } from 'react';
import type { AppConfig } from '../types';

interface ConfigPanelProps {
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="config-panel">
      <button className="btn btn-settings" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close' : 'Settings'}
      </button>
      {isOpen && (
        <div className="config-dropdown">
          <div className="config-item">
            <label>Default Node Value</label>
            <input
              type="number"
              value={config.defaultNodeValue}
              onChange={(e) => {
                const val = Number(e.target.value);
                onConfigChange({ ...config, defaultNodeValue: isNaN(val) ? -1 : val });
              }}
              className="config-input"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;

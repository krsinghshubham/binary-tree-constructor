import React, { useState, useMemo } from 'react';
import type { TreeNode } from '../types';
import { generateCode } from '../utils/codeGenerator';
import type { Language } from '../utils/codeGenerator';

interface CodeGeneratorProps {
  root: TreeNode | null;
  onClose: () => void;
}

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
];

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ root, onClose }) => {
  const [lang, setLang] = useState<Language>('python');
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => generateCode(root, lang), [root, lang]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content code-gen-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Generated Code</h3>
          <button className="btn-close" onClick={onClose}>x</button>
        </div>

        <div className="code-tabs">
          {LANGUAGES.map((l) => (
            <button
              key={l.value}
              className={`code-tab ${lang === l.value ? 'code-tab-active' : ''}`}
              onClick={() => setLang(l.value)}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="code-block-wrapper">
          <pre className="code-block">
            <code>{code}</code>
          </pre>
          <button className="btn btn-copy code-copy-btn" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;

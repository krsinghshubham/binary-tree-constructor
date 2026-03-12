import { useState } from 'react';

export interface ExportPanelProps {
  arrayString: string;
  treeJson?: string | object;
}

export function ExportPanel({ arrayString, treeJson }: ExportPanelProps) {
  const [copied, setCopied] = useState<'array' | 'json' | null>(null);

  const copyToClipboard = async (text: string, kind: 'array' | 'json') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const handleCopyArray = () => copyToClipboard(arrayString, 'array');

  const jsonString =
    treeJson === undefined
      ? undefined
      : typeof treeJson === 'string'
        ? treeJson
        : JSON.stringify(treeJson, null, 2);

  const handleCopyJson = () => {
    const toCopy = jsonString ?? JSON.stringify({ root: arrayString }, null, 2);
    copyToClipboard(toCopy, 'json');
  };

  return (
    <div className="export-panel" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <button
        type="button"
        className="btn btn-copy"
        onClick={handleCopyArray}
        title="Copy BFS array to clipboard"
      >
        {copied === 'array' ? 'Copied!' : 'Copy Array'}
      </button>
      <button
        type="button"
        className="btn btn-copy"
        onClick={handleCopyJson}
        title="Copy tree as JSON to clipboard"
      >
        {copied === 'json' ? 'Copied!' : 'Copy as JSON'}
      </button>
    </div>
  );
}

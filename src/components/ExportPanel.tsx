import { useState } from 'react';
import type { StructureKind } from '../types';

export interface ExportPanelProps {
  mode: StructureKind;
  /** Tree BFS array or graph edge list string */
  primaryText: string;
  treeJson?: string | object;
  graphJson?: object;
}

export function ExportPanel({ mode, primaryText, treeJson, graphJson }: ExportPanelProps) {
  const [copied, setCopied] = useState<'primary' | 'json' | null>(null);

  const copyToClipboard = async (text: string, kind: 'primary' | 'json') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const handleCopyPrimary = () => copyToClipboard(primaryText, 'primary');

  const jsonString =
    mode === 'tree'
      ? treeJson === undefined
        ? undefined
        : typeof treeJson === 'string'
          ? treeJson
          : JSON.stringify(treeJson, null, 2)
      : graphJson === undefined
        ? undefined
        : JSON.stringify(graphJson, null, 2);

  const handleCopyJson = () => {
    const fallback =
      mode === 'tree'
        ? JSON.stringify({ root: primaryText }, null, 2)
        : JSON.stringify({ edges: primaryText }, null, 2);
    const toCopy = jsonString ?? fallback;
    copyToClipboard(toCopy, 'json');
  };

  const primaryLabel = mode === 'tree' ? 'Copy array' : 'Copy graph text';
  const jsonTitle = mode === 'tree' ? 'Copy tree as JSON' : 'Copy graph as JSON';

  return (
    <div className="export-panel" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      <button
        type="button"
        className="btn btn-copy"
        onClick={handleCopyPrimary}
        title={
          mode === 'tree' ? 'Copy BFS array to clipboard' : 'Copy graph field (JSON or edge list)'
        }
      >
        {copied === 'primary' ? 'Copied!' : primaryLabel}
      </button>
      <button type="button" className="btn btn-copy" onClick={handleCopyJson} title={jsonTitle}>
        {copied === 'json' ? 'Copied!' : 'Copy as JSON'}
      </button>
    </div>
  );
}

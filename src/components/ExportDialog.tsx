import React from 'react';
import { downloadSVG, downloadPNG } from '../utils/exportTree';

interface ExportDialogProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ svgRef, onClose }) => {
  const handleSVG = () => {
    if (svgRef.current) {
      downloadSVG(svgRef.current);
      onClose();
    }
  };

  const handlePNG = async () => {
    if (svgRef.current) {
      await downloadPNG(svgRef.current);
      onClose();
    }
  };

  const handlePNG2x = async () => {
    if (svgRef.current) {
      await downloadPNG(svgRef.current, 'tree@2x.png', 3);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Export Tree</h3>
          <button className="btn-close" onClick={onClose}>x</button>
        </div>
        <div className="export-options">
          <button className="btn export-option-btn" onClick={handleSVG}>
            <span className="export-icon">SVG</span>
            <span className="export-desc">Vector format, scalable</span>
          </button>
          <button className="btn export-option-btn" onClick={handlePNG}>
            <span className="export-icon">PNG</span>
            <span className="export-desc">Raster image, 2x scale</span>
          </button>
          <button className="btn export-option-btn" onClick={handlePNG2x}>
            <span className="export-icon">PNG HD</span>
            <span className="export-desc">High resolution, 3x scale</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;

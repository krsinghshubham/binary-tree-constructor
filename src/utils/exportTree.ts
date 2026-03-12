export function downloadSVG(svgElement: SVGSVGElement, filename: string = 'tree.svg') {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const bgRect = clone.querySelector('.canvas-bg');
  if (bgRect) {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    bgRect.setAttribute('fill', isDark ? '#0c1222' : '#ffffff');
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename);
}

export function downloadPNG(
  svgElement: SVGSVGElement,
  filename: string = 'tree.png',
  scale: number = 2,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const bgRect = clone.querySelector('.canvas-bg');
    if (bgRect) {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      bgRect.setAttribute('fill', isDark ? '#0c1222' : '#ffffff');
    }

    const viewBox = clone.getAttribute('viewBox')?.split(' ').map(Number) ?? [0, 0, 300, 200];
    const width = viewBox[2] * scale;
    const height = viewBox[3] * scale;

    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          triggerDownload(blob, filename);
          resolve();
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG as image'));
    };
    img.src = url;
  });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

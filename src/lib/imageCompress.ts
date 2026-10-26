// Compress an image file to a Base64 JPEG under a target size using HTML5 Canvas.
// Returns { base64, sizeKB, originalSizeKB, width, height }.

export interface CompressedImage {
  base64: string;
  sizeKB: number;
  originalSizeKB: number;
  width: number;
  height: number;
}

const MAX_WIDTH = 800;
const TARGET_KB = 100;

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function canvasToBase64(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL('image/jpeg', quality);
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const originalSizeKB = Math.max(1, Math.round(file.size / 1024));
  const img = await fileToImage(file);

  const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không thể tạo canvas');
  ctx.drawImage(img, 0, 0, width, height);

  // Binary search for the best quality that fits under TARGET_KB.
  let lo = 0.3;
  let hi = 0.92;
  let best = canvasToBase64(canvas, hi);
  let bestQuality = hi;

  for (let i = 0; i < 6; i++) {
    const mid = (lo + hi) / 2;
    const b64 = canvasToBase64(canvas, mid);
    const kb = Math.round((b64.length * 3) / 4 / 1024);
    if (kb <= TARGET_KB) {
      best = b64;
      bestQuality = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  // If still over target, force a stronger compression pass.
  let finalB64 = best;
  let finalQuality = bestQuality;
  let finalKB = Math.round((finalB64.length * 3) / 4 / 1024);
  if (finalKB > TARGET_KB) {
    let q = 0.4;
    while (finalKB > TARGET_KB && q > 0.15) {
      finalB64 = canvasToBase64(canvas, q);
      finalKB = Math.round((finalB64.length * 3) / 4 / 1024);
      q -= 0.05;
    }
    finalQuality = q;
  }

  return {
    base64: finalB64,
    sizeKB: finalKB,
    originalSizeKB,
    width,
    height,
  };
  void finalQuality;
}

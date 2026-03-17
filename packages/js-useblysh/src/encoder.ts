import { encodeBase83, linearToSrgb, srgbToLinear, signPow } from './utils';

export const encode = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  componentsX: number = 4,
  componentsY: number = 3
): string => {
  if (componentsX < 1 || componentsX > 9 || componentsY < 1 || componentsY > 9) {
    throw new Error("Components must be between 1 and 9");
  }

  const factors: [number, number, number][] = [];

  for (let j = 0; j < componentsY; j++) {
    for (let i = 0; i < componentsX; i++) {
      const normalisation = (i === 0 ? 1 : 2) * (j === 0 ? 1 : 2);
      let r = 0, g = 0, b = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const basis = Math.cos((Math.PI * i * x) / width) * 
                        Math.cos((Math.PI * j * y) / height);
          const offset = (y * width + x) * 4;
          r += basis * srgbToLinear(pixels[offset]);
          g += basis * srgbToLinear(pixels[offset + 1]);
          b += basis * srgbToLinear(pixels[offset + 2]);
        }
      }

      const scale = normalisation / (width * height);
      factors.push([r * scale, g * scale, b * scale]);
    }
  }

  const dc = factors[0];
  const ac = factors.slice(1);

  let res = "";
  // Size flag
  res += encodeBase83((componentsX - 1) + (componentsY - 1) * 9, 1);

  // Max AC value
  let actualMaxAC = 1;
  if (ac.length > 0) {
    const maxAC = Math.max(...ac.map(f => Math.max(Math.abs(f[0]), Math.abs(f[1]), Math.abs(f[2]))));
    const quantMaxAC = Math.max(0, Math.min(82, Math.floor(maxAC * 166 - 0.5)));
    res += encodeBase83(quantMaxAC, 1);
    actualMaxAC = (quantMaxAC + 1) / 166;
  } else {
    res += encodeBase83(0, 1);
  }

  // Encode DC
  const encodeDC = (value: [number, number, number]) => {
    const r = linearToSrgb(value[0]);
    const g = linearToSrgb(value[1]);
    const b = linearToSrgb(value[2]);
    return (r << 16) + (g << 8) + b;
  };
  res += encodeBase83(encodeDC(dc), 4);

  // Encode AC
  const encodeAC = (value: [number, number, number], maximumValue: number) => {
    const quantR = Math.max(0, Math.min(18, Math.floor(signPow(value[0] / maximumValue, 0.5) * 9 + 9.5)));
    const quantG = Math.max(0, Math.min(18, Math.floor(signPow(value[1] / maximumValue, 0.5) * 9 + 9.5)));
    const quantB = Math.max(0, Math.min(18, Math.floor(signPow(value[2] / maximumValue, 0.5) * 9 + 9.5)));
    return quantR * 19 * 19 + quantG * 19 + quantB;
  };

  for (const factor of ac) {
    res += encodeBase83(encodeAC(factor, actualMaxAC), 2);
  }

  return res;
};

/**
 * Encodes an HTMLImageElement into a hash string.
 */
export const encodeImage = (
  image: HTMLImageElement,
  componentsX: number = 4,
  componentsY: number = 3
): string => {
  const canvas = document.createElement("canvas");
  // Resize to 32x32 for performance and consistency with Python version
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create canvas context");
  ctx.drawImage(image, 0, 0, 32, 32);
  const imageData = ctx.getImageData(0, 0, 32, 32);
  return encode(imageData.data, 32, 32, componentsX, componentsY);
};

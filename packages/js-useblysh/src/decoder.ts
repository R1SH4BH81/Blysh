import { decodeBase83, srgbToLinear, linearToSrgb, signPow } from './utils';

export const decode = (
  hash: string,
  width: number,
  height: number,
  punch: number = 1.0
): Uint8ClampedArray => {
  if (!hash || hash.length < 6) {
    throw new Error("The hash is invalid.");
  }

  const sizeFlag = decodeBase83(hash[0]);
  const componentsX = (sizeFlag % 9) + 1;
  const componentsY = Math.floor(sizeFlag / 9) + 1;

  const quantMaxAC = decodeBase83(hash[1]);
  const maxAC = (quantMaxAC + 1) / 166;

  const factors: [number, number, number][] = [];

  // Decode DC
  const dcValue = decodeBase83(hash.substring(2, 6));
  factors.push([
    srgbToLinear((dcValue >> 16) & 255),
    srgbToLinear((dcValue >> 8) & 255),
    srgbToLinear(dcValue & 255)
  ]);

  // Decode AC
  for (let i = 1; i < componentsX * componentsY; i++) {
    const acValue = decodeBase83(hash.substring(6 + (i - 1) * 2, 6 + i * 2));
    factors.push([
      signPow((Math.floor(acValue / (19 * 19)) - 9) / 9, 2.0) * maxAC * punch,
      signPow((Math.floor((acValue / 19) % 19) - 9) / 9, 2.0) * maxAC * punch,
      signPow(((acValue % 19) - 9) / 9, 2.0) * maxAC * punch
    ]);
  }

  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let j = 0; j < componentsY; j++) {
        for (let i = 0; i < componentsX; i++) {
          const basis = Math.cos((Math.PI * i * x) / width) * 
                        Math.cos((Math.PI * j * y) / height);
          const factor = factors[j * componentsX + i];
          r += factor[0] * basis;
          g += factor[1] * basis;
          b += factor[2] * basis;
        }
      }

      const offset = (y * width + x) * 4;
      pixels[offset] = linearToSrgb(r);
      pixels[offset + 1] = linearToSrgb(g);
      pixels[offset + 2] = linearToSrgb(b);
      pixels[offset + 3] = 255;
    }
  }

  return pixels;
};

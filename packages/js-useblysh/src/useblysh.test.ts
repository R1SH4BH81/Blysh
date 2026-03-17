import { describe, it, expect } from 'vitest';
import { encode, decode } from './index';

describe('useblysh', () => {
  it('should encode and decode correctly', () => {
    const width = 32;
    const height = 32;
    const pixels = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255;     // R
      pixels[i + 1] = 0;   // G
      pixels[i + 2] = 0;   // B
      pixels[i + 3] = 255; // A
    }

    const hash = encode(pixels, width, height, 4, 3);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(6);

    const decodedPixels = decode(hash, width, height);
    expect(decodedPixels).toBeInstanceOf(Uint8ClampedArray);
    expect(decodedPixels.length).toBe(width * height * 4);
    // Red channel should be high
    expect(decodedPixels[0]).toBeGreaterThan(200);
    // Green and Blue channels should be low
    expect(decodedPixels[1]).toBeLessThan(50);
    expect(decodedPixels[2]).toBeLessThan(50);
  });

  it('should throw error for invalid components', () => {
    const pixels = new Uint8ClampedArray(4 * 4 * 4);
    expect(() => encode(pixels, 4, 4, 0, 3)).toThrow("Components must be between 1 and 9");
    expect(() => encode(pixels, 4, 4, 10, 3)).toThrow("Components must be between 1 and 9");
  });

  it('should throw error for invalid hash', () => {
    expect(() => decode("", 32, 32)).toThrow("The hash is invalid.");
    expect(() => decode("abc", 32, 32)).toThrow("The hash is invalid.");
  });
});

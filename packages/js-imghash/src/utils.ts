export const CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

export const encodeBase83 = (value: number, length: number): string => {
  let result = "";
  for (let i = 1; i <= length; i++) {
    const digit = Math.floor(value / Math.pow(83, length - i)) % 83;
    result += CHARACTERS[digit];
  }
  return result;
};

export const decodeBase83 = (str: string): number => {
  let value = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const digit = CHARACTERS.indexOf(char);
    value = value * 83 + digit;
  }
  return value;
};

export const srgbToLinear = (value: number): number => {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

export const linearToSrgb = (value: number): number => {
  const v = Math.max(0, Math.min(1, value));
  return v <= 0.0031308
    ? Math.round(v * 12.92 * 255)
    : Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255);
};

export const signPow = (value: number, exp: number): number => {
  return Math.sign(value) * Math.pow(Math.abs(value), exp);
};

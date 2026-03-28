export type AsciiSettings = {
  width: number;
  charset: string;
  color: boolean;
  invert: boolean;
};

export type AsciiResult = {
  fileName: string;
  width: number;
  height: number;
  lines: string[];
  text: string;
  colors?: Uint8ClampedArray;
};

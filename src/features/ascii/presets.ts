export const CHAR_PRESETS: Array<{ name: string; value: string }> = [
  { name: "Standard", value: " .:-=+*#%@" },
  {
    name: "Detailed",
    value:
      " .'\"`,^:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  },
  { name: "Blocks", value: " ░▒▓█" },
  { name: "Minimal", value: " .@" },
  { name: "Binary", value: "01" },
];

export const DEFAULT_CHARSET = CHAR_PRESETS[0].value;

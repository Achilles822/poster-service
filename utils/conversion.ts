const textToImage = require("text-to-image");

export const ImageToBuffer = () => {
  // return textToImage.generateSync('Lorem ipsum dolor sit amet');
};
export const TextToBuffer = (
  text: string,
  options,
  composite: Function
): string => {
  return composite(textToImage.generateSync(text, options));
};

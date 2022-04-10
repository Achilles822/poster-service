const textToImage = require("text-to-image");

export const ImageToBuffer = () => {
  // return textToImage.generateSync('Lorem ipsum dolor sit amet');
};
export const TextToBuffer = (
  text: string,
  options,
  composite: Function
): string => {
  const uri = textToImage.generateSync(text, options).split(";base64,").pop();
  return composite({}, Buffer.from(uri, "base64"));
};

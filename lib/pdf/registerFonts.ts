import { Font } from "@react-pdf/renderer";

let isFontRegistered = false;

export const registerPdfFonts = () => {
  if (isFontRegistered) return;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const regularSrc = baseUrl ? `${baseUrl}/fonts/Phetsarath-Regular.ttf` : "/fonts/Phetsarath-Regular.ttf";
  const boldSrc = baseUrl ? `${baseUrl}/fonts/Phetsarath-Bold.ttf` : "/fonts/Phetsarath-Bold.ttf";

  Font.register({
    family: "phetsarathOT",
    fonts: [
      { src: regularSrc, fontWeight: "normal" },
      { src: boldSrc, fontWeight: "bold" },
    ],
  });

  Font.register({
    family: "PhetsarathOT",
    fonts: [
      { src: regularSrc, fontWeight: "normal" },
      { src: boldSrc, fontWeight: "bold" },
    ],
  });

  isFontRegistered = true;
};

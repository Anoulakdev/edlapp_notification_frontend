import { pdf, DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { registerPdfFonts } from "./registerFonts";

export async function generateAndDownloadPDF(
  document: React.ReactElement<DocumentProps>,
  filename: string
): Promise<void> {
  registerPdfFonts();
  const blob = await pdf(document).toBlob();
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

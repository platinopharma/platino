import { EFFECTIVE_DATE, ENTITY, LEGAL_VERSION, type LegalDoc } from "./legal-content";

// Client-side PDF generator for a legal document. Keeps typography and
// section breaks readable and matches the on-screen structure.
export async function downloadLegalPdf(doc: LegalDoc) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 56;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureRoom = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Header band
  pdf.setFillColor(240, 248, 244);
  pdf.rect(0, 0, pageWidth, 96, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(60, 110, 80);
  pdf.text(`${ENTITY.name.toUpperCase()} · LEGAL`, margin, 40);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(20, 30, 25);
  pdf.text(doc.title, margin, 72);
  y = 120;

  // Meta line
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(110, 110, 110);
  pdf.text(
    `Document ${String(doc.order).padStart(2, "0")} of 12  ·  Version ${LEGAL_VERSION}  ·  Last updated ${EFFECTIVE_DATE}`,
    margin,
    y,
  );
  y += 22;

  // Description
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.setTextColor(45, 45, 45);
  const desc = pdf.splitTextToSize(doc.description, contentWidth);
  ensureRoom(desc.length * 14 + 4);
  pdf.text(desc, margin, y);
  y += desc.length * 14 + 10;

  // Editable notice
  pdf.setDrawColor(210, 230, 220);
  pdf.setFillColor(246, 251, 248);
  const noticeText = `This document is maintained by ${ENTITY.legalName}. It is not an independent certification or a substitute for legal advice.`;
  const noticeLines = pdf.splitTextToSize(noticeText, contentWidth - 20);
  const noticeHeight = noticeLines.length * 12 + 20;
  ensureRoom(noticeHeight + 10);
  pdf.roundedRect(margin, y, contentWidth, noticeHeight, 6, 6, "FD");
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(9.5);
  pdf.setTextColor(70, 90, 80);
  pdf.text(noticeLines, margin + 10, y + 14);
  y += noticeHeight + 18;

  if (doc.intro) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(35, 35, 35);
    const intro = pdf.splitTextToSize(doc.intro, contentWidth);
    ensureRoom(intro.length * 14 + 8);
    pdf.text(intro, margin, y);
    y += intro.length * 14 + 12;
  }

  for (const section of doc.sections) {
    ensureRoom(30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(20, 40, 30);
    pdf.text(section.heading, margin, y);
    y += 16;
    pdf.setDrawColor(210, 220, 214);
    pdf.line(margin, y, margin + 40, y);
    y += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(40, 40, 40);

    if (section.body) {
      for (const para of section.body) {
        const lines = pdf.splitTextToSize(para, contentWidth);
        ensureRoom(lines.length * 13 + 6);
        pdf.text(lines, margin, y);
        y += lines.length * 13 + 8;
      }
    }
    if (section.bullets) {
      for (const b of section.bullets) {
        const lines = pdf.splitTextToSize(b, contentWidth - 16);
        ensureRoom(lines.length * 13 + 4);
        pdf.setFillColor(70, 140, 100);
        pdf.circle(margin + 3, y - 3, 1.6, "F");
        pdf.text(lines, margin + 14, y);
        y += lines.length * 13 + 4;
      }
      y += 6;
    }
    y += 6;
  }

  // Footer on each page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(140, 140, 140);
    pdf.text(
      `${ENTITY.name} · ${doc.title} · ${LEGAL_VERSION}`,
      margin,
      pageHeight - 28,
    );
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 28,
      { align: "right" },
    );
  }

  const safeSlug = doc.slug.replace(/[^a-z0-9-]/gi, "-");
  pdf.save(`${ENTITY.name.toLowerCase().replace(/\s+/g, "-")}-${safeSlug}-${LEGAL_VERSION}.pdf`);
}

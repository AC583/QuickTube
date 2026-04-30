import { jsPDF } from "jspdf";
import "jspdf-autotable";

export function exportToMarkdown(title: string, summary: string, highlights: any[]) {
  const content = `
# ${title}

${summary}

## Key Moments
${highlights.map(h => `- [${new Date(h.time * 1000).toISOString().substr(11, 8)}] ${h.label}`).join("\n")}
  `.trim();

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_")}_summary.md`;
  a.click();
}

export function exportToPDF(title: string, summary: string, highlights: any[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(title, 10, 20, { maxWidth: 190 });
  
  doc.setFontSize(12);
  doc.text("Video Summary", 10, 40);
  
  // Very basic markdown to text conversion (removing #)
  const plainSummary = summary.replace(/#/g, "").trim();
  const splitText = doc.splitTextToSize(plainSummary, 180);
  doc.text(splitText, 10, 50);
  
  let currentY = 50 + (splitText.length * 7);
  
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(14);
  doc.text("Key Moments", 10, currentY);
  currentY += 10;
  
  doc.setFontSize(10);
  highlights.forEach(h => {
    if (currentY > 280) {
      doc.addPage();
      currentY = 20;
    }
    const time = new Date(h.time * 1000).toISOString().substr(11, 8);
    doc.text(`[${time}] ${h.label}`, 10, currentY);
    currentY += 7;
  });
  
  doc.save(`${title.replace(/\s+/g, "_")}_summary.pdf`);
}

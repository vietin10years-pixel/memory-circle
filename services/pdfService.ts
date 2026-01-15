import jsPDF from 'jspdf';
import { Memory } from '../types';

export const generateJournalPDF = async (memories: Memory[], title: string = "My Memory Circle Journal") => {
  const doc = new jsPDF();
  let y = 20;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = doc.internal.pageSize.width - (margin * 2);

  // Cover Page
  doc.setFont("times", "bold");
  doc.setFontSize(30);
  doc.text(title, doc.internal.pageSize.width / 2, pageHeight / 2 - 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width / 2, pageHeight / 2 + 10, { align: 'center' });
  
  doc.addPage();

  // Memories
  for (const memory of memories) {
    // Check space
    if (y > pageHeight - 60) {
      doc.addPage();
      y = 20;
    }

    // Date & Location
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${memory.date} • ${memory.time} • ${memory.location}`, margin, y);
    y += 8;

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text(memory.title, margin, y);
    y += 10;

    // Image
    if (memory.imageUrl) {
      try {
        const imgProps = doc.getImageProperties(memory.imageUrl);
        const imgHeight = (contentWidth / imgProps.width) * imgProps.height;
        
        // Check if image fits
        if (y + imgHeight > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }

        doc.addImage(memory.imageUrl, 'JPEG', margin, y, contentWidth, imgHeight);
        y += imgHeight + 10;
      } catch (e) {
        console.warn("Could not load image for PDF", e);
      }
    }

    // Content
    doc.setFont("times", "italic");
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(memory.content, contentWidth);
    
    // Check if text fits
    if (y + (splitText.length * 7) > pageHeight - 20) {
       doc.addPage();
       y = 20;
    }
    
    doc.text(splitText, margin, y);
    y += (splitText.length * 7) + 20;

    // Separator
    doc.setDrawColor(200);
    doc.line(margin, y - 10, margin + contentWidth, y - 10);
  }

  doc.save("memory-circle-journal.pdf");
};

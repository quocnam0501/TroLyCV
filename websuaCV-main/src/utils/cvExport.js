import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportCVToPDF(element, filename = 'CV.pdf') {
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc) => {
      const clonedTemplate = clonedDoc.querySelector('[data-cv-template]');
      if (clonedTemplate) {
        clonedTemplate.style.transform = 'none';
        clonedTemplate.style.width = '794px';
        let node = clonedTemplate.parentElement;
        while (node && node !== clonedDoc.body) {
          node.style.height = 'auto';
          node.style.maxHeight = 'none';
          node.style.overflow = 'visible';
          node = node.parentElement;
        }
      }
    },
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  }

  pdf.save(filename);
}
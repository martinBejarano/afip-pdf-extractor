// pdfReader.js
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/node_modules/pdfjs-dist/build/pdf.worker.min.js';

async function readPDF(file) {
  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        text += pageText + ' ';
      }
      resolve(text);
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });
}

function extractData(text) {
  // Example: Extracting invoice number and date
  const invoiceNumberRegex = /Invoice Number:\s*(\d+)/;
  const dateRegex = /Date:\s*([\d/]+)/;

  const invoiceNumberMatch = text.match(invoiceNumberRegex);
  const dateMatch = text.match(dateRegex);

  const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : null;
  const date = dateMatch ? dateMatch[1] : null;

  return { invoiceNumber, date };
}

async function extractDataFromPDF(file) {
  try {
    const text = await readPDF(file);
    // const extractedData = extractData(text);
    return text;
  } catch (error) {
    console.error('Error reading PDF:', error);
  }
}

export { readPDF, extractData, extractDataFromPDF };
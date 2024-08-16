import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist'

const generateCSV = (invoiceDetails) => {
  const headers = ['Factura Number', 'Fecha', 'Subtotal', 'IVA', 'IIBB', 'Total'];
  const rows = [
    [
      invoiceDetails.facturaNumber,
      invoiceDetails.fecha,
      invoiceDetails.subtotal,
      invoiceDetails.iva,
      invoiceDetails.iibb,
      invoiceDetails.total,
    ],
  ];

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.join(',') + '\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'invoice_details.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const extractInvoiceDetails = (text) => {
  const facturaRegex = /FACTURA N°\s+(\d+)\s+(\d+)/;
  const fechaRegex = /\b\d{2}\/\d{2}\/\d{4}\b/;
  const totalRegex = /\b\d{1,3}(?:\d{3})*(?:\.\d{2})?\b/g;

  const facturaMatch = text.match(facturaRegex);
  const fechaMatch = text.match(fechaRegex);
  const totalMatches = text.match(totalRegex);

  const facturaNumber = facturaMatch ? `${facturaMatch[2]}-${facturaMatch[1]}` : null;
  const fecha = fechaMatch ? fechaMatch[0] : null;
  // const total = totalMatches && totalMatches.length > 1 ? totalMatches[totalMatches.length - 6] : null;
  // const total = totalMatches
  // extract last 5 matches of totalMatches
  const lastMatchedNumbers = totalMatches && totalMatches.length > 1 ? totalMatches.slice(-7) : null;

  const iva = lastMatchedNumbers ? lastMatchedNumbers[0] : null;

  const subtotal = lastMatchedNumbers ? lastMatchedNumbers[4] : null;

  const iibb = lastMatchedNumbers ? lastMatchedNumbers[5] : null;

  const total = lastMatchedNumbers ? lastMatchedNumbers[1] : null;

  return {
    facturaNumber,
    fecha,
    subtotal,
    iva,
    iibb,
    total,
  };
};
const PDFExtractor = () => {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  useEffect(() => {
    const loadWorker = async () => {
      const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    };
    loadWorker();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleExtractData = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map(item => item.str).join(' ');
          text += pageText + '\n';
        }

        const invoiceDetails = extractInvoiceDetails(text);

        // setExtractedText(JSON.stringify(invoiceDetails));
        // setExtractedText(text)

        setExtractedData(invoiceDetails);

        generateCSV(invoiceDetails);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className='flex flex-col items-center p-20'>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleExtractData} className='mt-4 p-2 bg-blue-500 text-white'>
        Extract Data
      </button>

      {
        extractedData && (
          <div className='mt-4 flex flex-col gap-16'>
            <pre>{JSON.stringify(extractedData, null, 2)}</pre>
          </div>
        )
      }
    </div>
  );
};

export default PDFExtractor;
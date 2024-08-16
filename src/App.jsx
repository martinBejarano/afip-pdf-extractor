import PDFExtractor from "./components/PDFExtractor"

function App() {

  return (
    <div className='flex flex-col items-center p-20'>
      <h1 className='text-3xl font-semibold'>Extractor de datos en facturas AFIP</h1>

      <PDFExtractor />
    </div>
  )
}

export default App

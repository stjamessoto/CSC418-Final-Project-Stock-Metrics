import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="p-8 text-2xl font-bold text-gray-800">Stock Metrics — scaffold ready</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

// Ticket 5 pages — imported once Santiago's tickets are wired in
// import Favorites  from './pages/Favorites';
// import StockDetail from './pages/StockDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Home />} />
        {/* Uncomment as Ticket 5 pages are added:
        <Route path="/favorites"       element={<Favorites />} />
        <Route path="/stock/:ticker"   element={<StockDetail />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}

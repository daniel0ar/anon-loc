import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import GpsPage from './components/GpsPage'

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/gps">GPS Data</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/gps" element={<GpsPage />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

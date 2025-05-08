import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import GpsPage from './components/GpsPage'
import AdminPage from './components/AdminPage'
import { StarknetConfig, publicProvider, braavos } from '@starknet-react/core';
import { mainnet, sepolia } from '@starknet-react/chains';

function App() {
  const connectors = [braavos()];
  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={connectors}
    >
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
              <li>
                <Link to="/admin">Admin</Link>
              </li>
            </ul>
          </nav>

          <Routes>
            <Route path="/gps" element={<GpsPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </div>
      </Router>
    </StarknetConfig>
  )
}

export default App

import React, { useState } from 'react';
import type { NoirPoint, NoirRegion } from '../types';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';

const emptyVertex: NoirPoint = { x: 0, y: 0 };

const AdminPage: React.FC = () => {
  const [vertices, setVertices] = useState<NoirRegion>([
    { ...emptyVertex },
    { ...emptyVertex },
    { ...emptyVertex },
    { ...emptyVertex },
  ]);
  const [saved, setSaved] = useState(false);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleVertexChange = (index: number, axis: 'x' | 'y', value: string) => {
    const newVertices = vertices.map((v, i) =>
      i === index ? { ...v, [axis]: Number(value) } : v
    );
    setVertices(newVertices);
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    console.log('Polygon vertices:', vertices);
  };

  return (
    <div className="gps-page" style={{ maxWidth: 500 }}>
      <div style={{ marginBottom: 24, textAlign: 'right' }}>
        {isConnected ? (
          <div>
            <span style={{ marginRight: 12, fontWeight: 500, color: '#4285f4' }}>
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <button onClick={() => disconnect()} className="primary-button" style={{ width: 'auto', padding: '0.5rem 1.5rem', background: '#d9534f' }}>
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="primary-button"
            style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
            disabled={isPending || connectors.length === 0}
          >
            {isPending ? 'Connecting...' : 'Connect Bravos Wallet'}
          </button>
        )}
      </div>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Admin Polygon Definition</h1>
      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {vertices.map((vertex, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ minWidth: 80, fontWeight: 500 }}>Vertex {idx + 1}:</span>
              <input
                type="number"
                value={vertex.x}
                onChange={e => handleVertexChange(idx, 'x', e.target.value)}
                placeholder="x"
                className=""
                style={{ width: 90, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
                required
              />
              <input
                type="number"
                value={vertex.y}
                onChange={e => handleVertexChange(idx, 'y', e.target.value)}
                placeholder="y"
                className=""
                style={{ width: 90, padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc' }}
                required
              />
            </div>
          ))}
        </div>
        <button type="submit" className="primary-button" style={{ marginTop: 32 }}>Save Polygon</button>
      </form>
      {saved && (
        <div className="info-box" style={{ marginTop: 24, textAlign: 'center' }}>
          <p>Polygon saved! (Check console for values)</p>
        </div>
      )}
      <div style={{ marginTop: 32 }}>
        <h4 style={{ color: '#4285f4', marginBottom: 12 }}>Preview Vertices</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vertices.map((v, i) => (
            <div key={i} style={{ background: '#f5f7fa', borderRadius: 4, padding: '0.5rem 1rem', border: '1px solid #e1e4e8', fontSize: 16 }}>
              <strong>Vertex {i + 1}:</strong> (x: {v.x}, y: {v.y})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 
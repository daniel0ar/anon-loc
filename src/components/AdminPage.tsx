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
  const [deploying, setDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);

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

  // Helper to convert JS numbers to felt252 strings
  const toFeltArray = (arr: number[]) => arr.map((n) => n.toString());

  // Deploy region verifier contract using Bravo wallet
  const handleDeploy = async () => {
    setDeploying(true);
    setDeployError(null);
    setDeployedAddress(null);
    try {
      // 1. Load contract class artifact dynamically (works in browser)
      const contractClass = (await import('../contracts/target/dev/region_verifier_UltraKeccakZKHonkVerifier.contract_class.json')).default;

      // 2. Connect to Bravo wallet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const starknet: any = await (window as any).starknet?.enable?.() ? (window as any).starknet : null;
      if (!starknet) throw new Error('Bravo wallet not found or connection rejected.');
      const account = starknet.account;
      if (!account) throw new Error('Bravo wallet account not found.');
      // 3. Prepare constructor calldata from vertices
      const vertices_x = toFeltArray(vertices.map((v) => v.x));
      const vertices_y = toFeltArray(vertices.map((v) => v.y));
      const constructorCalldata = [vertices_x, vertices_y];

      // 4. Declare contract
      const declareTx = await account.declare({ contract: contractClass });
      // Wait for declaration (optional: poll or just proceed)
      // 5. Deploy contract
      const deployTx = await account.deploy({ classHash: declareTx.class_hash, constructorCalldata });
      setDeployedAddress(deployTx.contract_address);
    } catch (err: unknown) {
      setDeployError((err as Error).message || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
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
      <div style={{ marginTop: 32 }}>
        <button
          onClick={handleDeploy}
          className="primary-button"
          style={{ width: '100%', padding: '0.75rem', background: '#4285f4' }}
          disabled={deploying || !isConnected}
        >
          {deploying ? 'Deploying Region Verifier...' : 'Deploy Region Verifier Contract'}
        </button>
        {deployError && <div style={{ color: 'red', marginTop: 12 }}>{deployError}</div>}
        {deployedAddress && (
          <div style={{ color: 'green', marginTop: 12 }}>
            Contract deployed at: <code>{deployedAddress}</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage; 
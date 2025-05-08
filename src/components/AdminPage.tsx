import React, { useState, useEffect } from 'react';
import type { NoirPoint, NoirRegion } from '../types';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import MapSelector from './MapSelector';

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
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Handle vertices change from map
  const handleMapVerticesChange = (newVertices: NoirRegion) => {
    setVertices(newVertices);
    setSaved(false);
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
      // Also load compiled contract class (casm)
      const compiledContractClass = (await import('../contracts/target/dev/region_verifier_UltraKeccakZKHonkVerifier.compiled_contract_class.json')).default;

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
      const declareTx = await account.declare({ 
        contract: contractClass,
        casm: compiledContractClass
      });
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
    <div className="admin-page-container" style={{ 
      maxWidth: isDesktop ? '1200px' : '100%',
      margin: '0 auto',
      padding: isDesktop ? '2rem' : '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div className="admin-header" style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexDirection: isDesktop ? 'row' : 'column',
        gap: isDesktop ? '0' : '1rem'
      }}>
        <h1 style={{ 
          fontSize: isDesktop ? '2.5rem' : '2rem',
          fontWeight: 600,
          margin: 0,
          color: '#333',
          textAlign: isDesktop ? 'left' : 'center'
        }}>Admin Polygon Definition</h1>
        
        <div className="wallet-connect">
          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 500, color: '#4285f4' }}>
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button 
                onClick={() => disconnect()} 
                className="primary-button" 
                style={{ 
                  width: 'auto', 
                  padding: '0.5rem 1.5rem', 
                  background: '#d9534f',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'background 0.2s ease'
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="primary-button"
              style={{ 
                width: 'auto', 
                padding: '0.6rem 1.8rem',
                background: '#4285f4', 
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background 0.2s ease',
                fontSize: '1rem'
              }}
              disabled={isPending || connectors.length === 0}
            >
              {isPending ? 'Connecting...' : 'Connect Bravos Wallet'}
            </button>
          )}
        </div>
      </div>
      
      <div className="admin-content" style={{
        display: isDesktop ? 'grid' : 'flex',
        gridTemplateColumns: isDesktop ? '3fr 2fr' : 'auto',
        gap: '2rem',
        flexDirection: 'column'
      }}>
        <div className="left-column">
          <div className="map-section" style={{ 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#4285f4', 
              marginTop: 0,
              marginBottom: '1rem' 
            }}>
              Select Polygon Vertices on Map
            </h2>
            <p style={{ color: '#666', marginBottom: '1.25rem' }}>
              Click on the map to place vertices of your polygon region.
              You can drag markers to adjust positions.
            </p>
            
            <MapSelector 
              vertices={vertices} 
              onChange={handleMapVerticesChange} 
              maxVertices={4}
            />
          </div>
        </div>
        
        <div className="right-column">
          <form onSubmit={handleSave} style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#4285f4', 
              marginTop: 0,
              marginBottom: '1rem' 
            }}>
              Manual Coordinate Entry
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {vertices.map((vertex, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  backgroundColor: '#fff',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #eaecef'
                }}>
                  <span style={{ 
                    minWidth: '90px', 
                    fontWeight: 500,
                    color: '#333'
                  }}>
                    Vertex {idx + 1}:
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexGrow: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <small style={{ color: '#666', marginBottom: '0.25rem' }}>X:</small>
                      <input
                        type="number"
                        value={vertex.x}
                        onChange={e => handleVertexChange(idx, 'x', e.target.value)}
                        placeholder="x"
                        style={{ 
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <small style={{ color: '#666', marginBottom: '0.25rem' }}>Y:</small>
                      <input
                        type="number"
                        value={vertex.y}
                        onChange={e => handleVertexChange(idx, 'y', e.target.value)}
                        placeholder="y"
                        style={{ 
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              type="submit" 
              className="primary-button" 
              style={{ 
                marginTop: '1.5rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1rem',
                fontWeight: 500,
                cursor: 'pointer',
                width: '100%',
                fontSize: '1rem',
                transition: 'background 0.2s ease'
              }}
            >
              Save Polygon
            </button>
          </form>
          
          {saved && (
            <div className="info-box" style={{ 
              marginBottom: '1.5rem',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: '#e8f5e9',
              border: '1px solid #b9f6ca',
              borderRadius: '4px'
            }}>
              <p style={{ margin: 0, color: '#1b5e20', fontWeight: 500 }}>
                Polygon saved! (Check console for values)
              </p>
            </div>
          )}
          
          <div className="vertices-preview" style={{ 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#4285f4', 
              marginTop: 0,
              marginBottom: '1rem' 
            }}>
              Preview Vertices
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {vertices.map((v, i) => (
                <div key={i} style={{ 
                  background: 'white', 
                  borderRadius: '4px', 
                  padding: '0.75rem 1rem', 
                  border: '1px solid #eaecef', 
                  fontSize: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <strong style={{ color: '#333' }}>Vertex {i + 1}:</strong> 
                  <span style={{ fontFamily: 'monospace', backgroundColor: '#f1f3f4', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                    (x: {v.x}, y: {v.y})
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="deploy-section" style={{ 
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#4285f4', 
              marginTop: 0,
              marginBottom: '1rem' 
            }}>
              Deploy Verifier
            </h2>
            <button
              onClick={handleDeploy}
              className="primary-button"
              style={{ 
                width: '100%', 
                padding: '0.75rem 1rem', 
                background: '#4285f4',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '1rem',
                transition: 'background 0.2s ease'
              }}
              disabled={deploying || !isConnected}
            >
              {deploying ? 'Deploying Region Verifier...' : 'Deploy Region Verifier Contract'}
            </button>
            {deployError && (
              <div style={{ 
                color: '#d32f2f', 
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                border: '1px solid #ffcdd2',
                fontSize: '0.9rem'
              }}>
                {deployError}
              </div>
            )}
            {deployedAddress && (
              <div style={{ 
                color: '#2e7d32', 
                marginTop: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#e8f5e9',
                borderRadius: '4px',
                border: '1px solid #c8e6c9',
                wordBreak: 'break-all'
              }}>
                Contract deployed at: <br />
                <code style={{ 
                  display: 'block', 
                  padding: '0.5rem', 
                  marginTop: '0.5rem',
                  background: '#f5f5f5', 
                  borderRadius: '4px',
                  border: '1px solid #eee',
                  fontFamily: 'monospace'
                }}>
                  {deployedAddress}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage; 
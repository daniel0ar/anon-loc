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
  const [, setIsDesktop] = useState(window.innerWidth >= 768); // TODO: Do something with desktop detection

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

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

  const handleMapVerticesChange = (newVertices: NoirRegion) => {
    setVertices(newVertices);
    setSaved(false);
  };

  const toFeltArray = (arr: number[]) => arr.map((n) => n.toString());

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployError(null);
    setDeployedAddress(null);
    try {
      const contractClass = (await import('../contracts/target/dev/region_verifier_UltraKeccakZKHonkVerifier.contract_class.json')).default;
      const compiledContractClass = (await import('../contracts/target/dev/region_verifier_UltraKeccakZKHonkVerifier.compiled_contract_class.json')).default;

      const starknet: any = await (window as any).starknet?.enable?.() ? (window as any).starknet : null;
      if (!starknet) throw new Error('Bravo wallet not found or connection rejected.');
      const account = starknet.account;
      if (!account) throw new Error('Bravo wallet account not found.');
      const vertices_x = toFeltArray(vertices.map((v) => v.x));
      const vertices_y = toFeltArray(vertices.map((v) => v.y));
      const constructorCalldata = [vertices_x, vertices_y];

      const declareTx = await account.declare({ 
        contract: contractClass,
        casm: compiledContractClass
      });
      const deployTx = await account.deploy({ classHash: declareTx.class_hash, constructorCalldata });
      setDeployedAddress(deployTx.contract_address);
    } catch (err: unknown) {
      setDeployError((err as Error).message || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 font-sans dark:bg-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 md:gap-0">
        <h1 className="text-2xl md:text-4xl font-semibold text-center md:text-left text-gray-800 dark:text-gray-100">
          Admin Polygon Definition
        </h1>
        
        <div className="wallet-connect">
          {isConnected ? (
            <div className="flex items-center gap-4">
              <span className="font-medium text-blue-500 dark:text-blue-400">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button 
                onClick={() => disconnect()} 
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="px-7 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPending || connectors.length === 0}
            >
              {isPending ? 'Connecting...' : 'Connect Bravos Wallet'}
            </button>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-[3fr,2fr] gap-8">
        <div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-2xl text-blue-500 dark:text-blue-400 mb-4">
              Select Polygon Vertices on Map
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-5">
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
        
        <div>
          <form onSubmit={handleSave} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-2xl text-blue-500 dark:text-blue-400 mb-4">
              Manual Coordinate Entry
            </h2>
            <div className="flex flex-col gap-4">
              {vertices.map((vertex, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                  <span className="min-w-[90px] font-medium text-gray-700 dark:text-gray-200">
                    Vertex {idx + 1}:
                  </span>
                  <div className="flex gap-2 flex-grow">
                    <div className="flex flex-col w-full">
                      <small className="text-gray-600 dark:text-gray-300 mb-1">X:</small>
                      <input
                        type="number"
                        value={vertex.x}
                        onChange={e => handleVertexChange(idx, 'x', e.target.value)}
                        placeholder="x"
                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        required
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <small className="text-gray-600 dark:text-gray-300 mb-1">Y:</small>
                      <input
                        type="number"
                        value={vertex.y}
                        onChange={e => handleVertexChange(idx, 'y', e.target.value)}
                        placeholder="y"
                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button 
              type="submit" 
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white rounded py-3 px-4 font-medium text-base transition-colors"
            >
              Save Polygon
            </button>
          </form>
          
          {saved && (
            <div className="mb-6 p-4 text-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Polygon saved! (Check console for values)
              </p>
            </div>
          )}
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-2xl text-blue-500 dark:text-blue-400 mb-4">
              Preview Vertices
            </h2>
            <div className="flex flex-col gap-3">
              {vertices.map((v, i) => (
                <div key={i} className="bg-white dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600 text-base flex justify-between">
                  <strong className="text-gray-700 dark:text-gray-200">Vertex {i + 1}:</strong> 
                  <span className="font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                    (x: {v.x}, y: {v.y})
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl text-blue-500 dark:text-blue-400 mb-4">
              Deploy Verifier
            </h2>
            <button
              onClick={handleDeploy}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={deploying || !isConnected}
            >
              {deploying ? 'Deploying Region Verifier...' : 'Deploy Region Verifier Contract'}
            </button>
            {deployError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded border border-red-200 dark:border-red-900 text-sm">
                {deployError}
              </div>
            )}
            {deployedAddress && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-200 rounded border border-green-200 dark:border-green-900 break-all">
                Contract deployed at: <br />
                <code className="block p-2 mt-2 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 font-mono">
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
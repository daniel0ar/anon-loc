import React, { useState } from "react";
import { useLocation } from "../hooks/useLocation";
import { generateProof } from "../zk/generateProof";
import type { LatLng, NoirPoint, NoirRegion } from "../types";

type Props = {
  region: LatLng[]; // Four points: [[lat, lon], ...]
  onProofGenerated: (proof: any, publicInput: any) => void;
};

export const AnonLocButton: React.FC<Props> = ({ region, onProofGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getCurrentLocation } = useLocation();

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentLocation();
      const point: NoirPoint = {
        x: Math.floor(position.coords.longitude * 1e6),
        y: Math.floor(position.coords.latitude * 1e6),
      };

      const formattedRegion: NoirRegion = region.map(([lat, lon]) => ({
        x: Math.floor(lon * 1e6),
        y: Math.floor(lat * 1e6),
      }));

      const { proof, publicInput } = await generateProof(formattedRegion, point);

      onProofGenerated(proof, publicInput);
    } catch (err: any) {
      console.error(err);
      setError("Failed to generate proof.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Generating Proof..." : "Prove Location"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

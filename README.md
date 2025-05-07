# Noloc
Private location proving widget

## Installation

## Development
### Repo structure
```
noloc/
├── public/
├── src/
│   ├── components/
│   │   └── AnonLocButton.tsx
│   ├── hooks/
│   │   └── useLocation.ts
│   ├── zk/
│   │   ├── generateProof.ts
│   │   └── verifier.json        # From Noir
│   ├── utils/
│   │   └── geo.ts               # Coordinate transforms, ray casting (optional)
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── noir/
│   └── location-proof/          # Noir program (for reference)
├── package.json
└── vite.config.ts
```

### Core functionality
Noloc.tsx
    Shows a button.
    On click:
        Uses useLocation() to get user coordinates.
        Converts region + point to Noir format.
        Calls generateProof(region, point).
        Calls onProofGenerated(proof, publicInput).

useLocation.ts
    Wrapper around navigator.geolocation.getCurrentPosition.

generateProof.ts
    Imports WASM and verifier artifacts.
    Runs Noir program in browser with public (region) and private (point) inputs.
    Outputs the proof + public input for server-side verification.
geo.ts
    Optional helpers: convert GPS to flat coordinates (e.g., using equirectangular projection).
    Verify point-in-polygon using ray casting (debugging, precheck).

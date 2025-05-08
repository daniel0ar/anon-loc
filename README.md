# Noloc
Private location proving widget

## Installation

First, compile the circuits using Nargo:
```sh
cd src/circuits
nargo compile
```
Then, run the server:
```sh
cd ../../
pnpm run dev
#or
npm run dev
#or
yarn dev
```

This app aims to be used on mobile devices, so it's recommended to use a tunnel:
```sh
yarn dev -- --host
#or
ngrok http 3000
```

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

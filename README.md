# Noloc

Private, privacy-preserving location proof widget

## Introduction
Noloc enables users to prove they are within a geographic region **without revealing their exact location**. It leverages zero-knowledge proofs (ZKPs) and smart contracts to provide verifiable, private geolocation on-chain. The project is built for mobile-first use and is ideal for applications requiring location verification without privacy compromise.

- **Frontend:** React + Vite + TailwindCSS
- **ZK Circuits:** Noir (see [github.com/berkingurcan/grp](https://github.com/berkingurcan/grp))
- **Smart Contracts:** Cairo (Starknet, see [github.com/berkingurcan/grp](https://github.com/berkingurcan/grp))

## Features
- Prove you are inside a region without revealing your coordinates
- All proofs are generated client-side; your location never leaves your device
- Verifiable on Starknet blockchain
- Admins can define custom regions
- Mobile-first, PWA-ready

## Architecture
```
noloc/
├── public/                  # Static assets
├── src/
│   ├── components/          # UI components (e.g., AnonLocButton, HomePage, MapSelector)
│   ├── hooks/               # Custom React hooks (e.g., useLocation)
│   ├── circuits/            # Noir circuits (see Setup)
│   ├── contracts/           # Cairo smart contracts (see Setup)
│   ├── scripts/             # ZK proof generation (generateProof.ts)
│   ├── types/               # Shared TypeScript types
│   └── App.tsx, main.tsx    # App entry points
├── package.json             # Frontend dependencies
└── vite.config.ts           # Vite config
```

## Setup Instructions
### 1. Clone the repository
```sh
git clone https://github.com/daniel0ar/noloc
cd noloc
```

### 2. Install dependencies
```sh
yarn install   # or npm install or pnpm install
```

### 3. Compile the ZK Circuits (Noir)
The ZK circuits are based on [github.com/berkingurcan/grp](https://github.com/berkingurcan/grp). You must have [Nargo](https://noir-lang.org/docs/getting_started/nargo_installation/) installed.

```sh
cd src/circuits
nargo compile
cd ../../
```

### 4. Build and Deploy Smart Contracts (Starknet/Cairo)
The smart contracts are also based on [github.com/berkingurcan/grp](https://github.com/berkingurcan/grp). You must have [Scarb](https://docs.swmansion.com/scarb/) and [sncast](https://github.com/foundry-rs/starknet-foundry/tree/main/crates/sncast) installed.

```sh
cd src/contracts
scarb build
# To deploy (edit sncast.toml for network/account):
sncast declare --contract target/dev/region_verifier_UltraKeccakZKHonkVerifier.contract_class.json
sncast deploy --class-hash <CLASS_HASH>
cd ../../
```

### 5. Run the Frontend
```sh
yarn dev   # or npm run dev or pnpm run dev
# For mobile/tunnel access:
yarn dev -- --host
# or
ngrok http 3000
```

## Development
- **Proof Generation:** `src/scripts/generateProof.ts` runs Noir circuits in-browser using WASM.
- **Location Access:** `src/hooks/useLocation.ts` wraps browser geolocation APIs.
- **Main Widget:** `src/components/NoLoc.tsx` (AnonLocButton) handles user interaction and proof flow.
- **Region Selection:** Admins can define regions via the UI (see MapSelector, AdminPage).

## Acknowledgements
- **Circuits and Smart Contracts:** This project uses circuits and contracts from [github.com/berkingurcan/grp](https://github.com/berkingurcan/grp).
- Built for Noirhack by [Berkin Gürcan](https://github.com/berkingurcan) and [Daniel Arroyo](https://github.com/daniel0ar).

---
For more details, see the code comments and referenced external repositories.

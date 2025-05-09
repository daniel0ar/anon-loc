# Noloc

Private location proving widget using circuits and smart contracts.

This project utilizes circuits and smart contracts from the repository: [github.com/berkingurcan/grp](https://github.com/berkingurcan/grp).

## Installation

### Prerequisites

- Node.js and npm (or yarn/pnpm) installed on your machine.
- Nargo for compiling Noir circuits.

### Setup

1. **Clone the repository**
   ```sh
   git clone <repository-url>
   cd noloc
   ```

2. **Install dependencies**
   ```sh
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Compile the circuits**
   Navigate to the circuits directory and compile using Nargo:
   ```sh
   cd src/circuits
   nargo compile
   ```

4. **Run the development server**
   Navigate back to the root directory and start the server:
   ```sh
   cd ../../
   npm run dev
   # or
   yarn dev
   # or
   pnpm run dev
   ```

   For mobile device testing, use a tunnel:
   ```sh
   yarn dev -- --host
   # or
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

- **Noloc.tsx**: Displays a button that, when clicked, retrieves user coordinates, converts them to Noir format, generates a proof, and calls a callback with the proof and public input.

- **useLocation.ts**: A wrapper around `navigator.geolocation.getCurrentPosition` to obtain user location.

- **generateProof.ts**: Runs the Noir program in the browser with public (region) and private (point) inputs, outputting the proof and public input for server-side verification.

- **geo.ts**: Provides optional helpers for GPS coordinate conversion and point-in-polygon verification using ray casting.

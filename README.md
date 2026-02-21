# micronoise-eliza-plugin

ElizaOS plugin for token swaps via x402 payments on Base chain.

## Features

- **SWAP_TOKEN**: Execute token swaps (ETH → USDC, SOL → ETH, etc.)
- **GET_QUOTE**: Get swap quotes without executing
- **SwapProvider**: Real-time swap rates
- **x402 Payments**: Automatic payment handling for swap fees
- **Base Chain**: Built for Base network with Uniswap V3

## Installation

```bash
npm install micronoise-eliza-plugin
```

## Usage

```typescript
import { initializeRuntime } from "@elizaos/core";
import { micronoisePlugin } from "micronoise-eliza-plugin";

// Initialize with plugin
const runtime = await initializeRuntime({
  plugins: [micronoisePlugin],
  settings: {
    WALLET_ADDRESS: "0x..." // Optional: agent wallet address
  }
});

// Agent can now understand and execute swaps
```

## Actions

### SWAP_TOKEN

Swap one token for another.

```typescript
// Agent understands: "Swap 0.1 ETH to USDC"
await runtime.executeAction("SWAP_TOKEN", {
  fromToken: "ETH",
  toToken: "USDC",
  amount: 0.1
});
```

### GET_QUOTE

Get swap quote without executing.

```typescript
// Agent understands: "What's the rate for swapping ETH to USDC?"
await runtime.executeAction("GET_QUOTE", {
  fromToken: "ETH",
  toToken: "USDC",
  amount: 1
});
```

## Supported Tokens

- ETH, WETH (Base)
- WBTC (Wrapped Bitcoin)
- SOL (via Wormhole)
- USDC, USDT, DAI (Base)

## API Endpoints

- **Quote**: `https://micronoise.vercel.app/api/swap/quote?from=ETH&to=USDC&amount=0.1`
- **Execute**: `https://micronoise.vercel.app/api/swap/execute?from=ETH&to=USDC&amount=0.1`

## Agent Persona Example

Add to your character file:

```json
{
  "plugins": ["micronoise-eliza-plugin"],
  "style": {
    "all": [
      "can execute token swaps when user asks",
      "always confirms amount before swapping",
      "shows quote before executing swap"
    ]
  }
}
```

## Pricing

- Quotes: Free
- Swaps: 0.001 USDC per swap (x402 payment)
- Network: Base (eip155:8453)

## Documentation

- **Swap Demo**: https://micronoise.vercel.app/swap
- **API Docs**: https://micronoise.vercel.app
- **ElizaOS Docs**: https://docs.elizaos.ai
- **GitHub**: https://github.com/dontonon/micronoise-eliza-plugin

## License

MIT

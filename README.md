# @micronoise/eliza-plugin

MicroNoise swap plugin for ElizaOS - Enable your AI agents to swap tokens with x402 payments.

## Features

- **SWAP_TOKEN**: Execute token swaps (ETH → USDC, SOL → ETH, etc.)
- **GET_QUOTE**: Get swap quotes without executing
- **SwapProvider**: Real-time swap rates
- **x402 Payments**: Automatic payment handling for swap fees

## Installation

```bash
npm install micronoise-eliza-plugin
```

## Usage

```typescript
import { initializeRuntime } from "@elizaos/core";
import { micronoisePlugin } from "@micronoise/eliza-plugin";

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

- ETH, WETH
- BTC, WBTC
- SOL
- USDC, USDT, DAI
- And more via Uniswap/DEX aggregators

## Agent Persona Example

Add to your character file:

```json
{
  "plugins": ["@micronoise/eliza-plugin"],
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
- Swaps: Gas + 0.1% fee (paid via x402)
- Agent usage: Free tier 100 swaps/day

## Documentation

- [MicroNoise API](https://micronoise.vercel.app)
- [ElizaOS Docs](https://docs.elizaos.ai)

## License

MIT

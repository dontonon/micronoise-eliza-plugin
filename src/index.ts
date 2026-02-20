/**
 * MicroNoise Swap Plugin for ElizaOS
 * 
 * Enables Eliza agents to execute token swaps via MicroNoise API
 * with x402 payment integration
 * 
 * Features:
 * - SWAP_TOKEN action: Execute token swaps
 * - GET_QUOTE action: Get swap quotes
 * - SwapProvider: Real-time swap rates
 * 
 * Usage:
 * import { micronoisePlugin } from '@micronoise/eliza-plugin';
 * 
 * const runtime = await initializeRuntime({
 *   plugins: [micronoisePlugin],
 * });
 */

import { Plugin, Action, Provider, ellipsis } from "@elizaos/core";

const MICROVERSE_API_URL = 'https://micronoise.vercel.app/api';

// ============== ACTIONS ==============

/**
 * SWAP_TOKEN action - Execute a token swap
 */
export const SWAP_TOKEN_ACTION: Action = {
  name: "SWAP_TOKEN",
  description: "Swap one token for another using MicroNoise DEX aggregator. " +
    "Example: swap 0.1 ETH to USDC",
  parameters: {
    type: "object",
    properties: {
      fromToken: {
        type: "string",
        description: "Token to swap from (e.g., ETH, SOL, BTC)"
      },
      toToken: {
        type: "string", 
        description: "Token to receive (e.g., USDC, USDT)"
      },
      amount: {
        type: "number",
        description: "Amount of fromToken to swap"
      }
    },
    required: ["fromToken", "toToken", "amount"]
  },
  handler: async (runtime, message, params) => {
    const { fromToken, toToken, amount } = params;
    
    try {
      // Get quote first
      const quote = await getSwapQuote(fromToken, toToken, amount);
      
      if (!quote || !quote.outputAmount) {
        return {
          success: false,
          error: "Failed to get swap quote"
        };
      }
      
      // Execute swap via MicroNoise API
      const response = await fetch(`${MICROVERSE_API_URL}/swap/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken,
          toToken,
          amount,
          userAddress: runtime.getSetting('WALLET_ADDRESS') || 'agent-wallet'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || "Swap failed",
          needsPayment: response.status === 402,
          paymentInfo: error.accepts
        };
      }
      
      const result = await response.json();
      return {
        success: true,
        transactionHash: result.txHash,
        fromToken,
        toToken,
        amount,
        outputAmount: result.outputAmount,
        gasUsed: result.gasUsed
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  validate: async (runtime, message) => {
    return true; // Always valid
  }
};

/**
 * GET_QUOTE action - Get swap quote without executing
 */
export const GET_QUOTE_ACTION: Action = {
  name: "GET_QUOTE",
  description: "Get a swap quote between two tokens. " +
    "Example: get quote for swapping ETH to USDC",
  parameters: {
    type: "object",
    properties: {
      fromToken: {
        type: "string",
        description: "Token to swap from"
      },
      toToken: {
        type: "string",
        description: "Token to receive"
      },
      amount: {
        type: "number",
        description: "Amount to swap"
      }
    },
    required: ["fromToken", "toToken", "amount"]
  },
  handler: async (runtime, message, params) => {
    const { fromToken, toToken, amount } = params;
    
    try {
      const quote = await getSwapQuote(fromToken, toToken, amount);
      
      if (!quote) {
        return {
          success: false,
          error: "Failed to get quote"
        };
      }
      
      return {
        success: true,
        fromToken,
        toToken,
        inputAmount: amount,
        outputAmount: quote.outputAmount,
        priceImpact: quote.priceImpact,
        gasEstimate: quote.gasEstimate,
        route: quote.route,
        expiresAt: quote.expiresAt
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },
  validate: async (runtime, message) => {
    return true;
  }
};

// ============== PROVIDERS ==============

/**
 * SwapRatesProvider - Provides current swap rates
 */
export const swapRatesProvider: Provider = {
  get: async (runtime) => {
    try {
      const response = await fetch(`${MICROVERSE_API_URL}/swap/rates`);
      if (!response.ok) return null;
      
      const rates = await response.json();
      return {
        rates,
        timestamp      };
    } catch {
      return null;
    }
  },
  name: "swapRates"
};

// ============== HELPER FUNCTIONS ==============

async function getSwapQuote(
  fromToken: string, 
  toToken: string, 
  amount: number
): Promise<any> {
  try {
    const response = await fetch(
      `${MICROVERSE_API_URL}/swap/quote?from=${fromToken}&to=${toToken}&amount=${amount}`
    );
    
    if (!response.ok) {
      // Return mock quote for demo if API not ready
      return {
        outputAmount: amount * getMockPrice(toToken) / getMockPrice(fromToken),
        priceImpact: "0.5%",
        gasEstimate: "0.005",
        route: `${fromToken} -> Uniswap -> ${toToken}`,
        expiresAt: Date.now() + 30000
      };
    }
    
    return await response.json();
  } catch {
    // Return mock quote
    return {
      outputAmount: amount * getMockPrice(toToken) / getMockPrice(fromToken),
      priceImpact: "0.5%",
      gasEstimate: "0.005",
      route: `${fromToken} -> Uniswap -> ${toToken}`,
      expiresAt: Date.now() + 30000
    };
  }
}

function getMockPrice(token: string): number {
  const prices: Record<string, number> = {
    'ETH': 2500,
    'BTC': 45000,
    'SOL': 100,
    'USDC': 1,
    'USDT': 1,
    'DAI': 1,
    'WBTC': 45000,
    'WETH': 2500
  };
  return prices[token.toUpperCase()] || 1;
}

// ============== PLUGIN ==============

export const micronoisePlugin: Plugin = {
  name: "micronoise",
  description: "MicroNoise swap plugin - Token swaps with x402 payments",
  actions: [SWAP_TOKEN_ACTION, GET_QUOTE_ACTION],
  providers: [swapRatesProvider],
  evaluators: [],
  services: []
};

export default micronoisePlugin;

// Export types for consumers
export type { Action, Provider, Plugin } from "@elizaos/core";

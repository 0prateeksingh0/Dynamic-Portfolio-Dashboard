// Isolating Yahoo Finance instantiation to bypass ESM/Next.js conflicts.
// Using require() ensures correct class loading.

/* eslint-disable @typescript-eslint/no-require-imports */
const { default: YahooFinance } = require('yahoo-finance2');

class YahooClient {
    private client: any;

    constructor() {
        // Manual instantiation required by library architecture
        this.client = new YahooFinance();
    }

    async quote(symbol: string | string[]) {
        return this.client.quote(symbol);
    }

    async quoteCombine(symbols: string[]) {
        return this.client.quote(symbols);
    }

    // Expose other methods if needed
}

// Export a singleton instance
const yahooClient = new YahooClient();
export default yahooClient;

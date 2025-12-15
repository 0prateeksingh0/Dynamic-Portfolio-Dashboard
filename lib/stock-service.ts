import yahooClient from './yahoo-client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { PortfolioItem, StockData } from '@/types';

// Load portfolio data
const getStaticPortfolio = (): PortfolioItem[] => {
    try {
        const filePath = path.join(process.cwd(), 'data/portfolio.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Failed to load portfolio.json', error);
        return [];
    }
};

// Yahoo Finance: Fetch current prices
const fetchYahooPrices = async (symbols: string[]): Promise<Map<string, number>> => {
    const priceMap = new Map<string, number>();

    // Yahoo finance2 expectations:
    // NSE symbols need '.NS' suffix.
    const yahooSymbols = symbols
        .filter(s => typeof s === 'string' && s.trim() !== '')
        .map(s => s.endsWith('.NS') || s.endsWith('.BO') ? s : `${s}.NS`);

    // Return early if empty
    if (yahooSymbols.length === 0) return priceMap;

    try {
        // Use the isolated client
        const results = await yahooClient.quote(yahooSymbols) as any[];

        // Normalize result to array
        const list = Array.isArray(results) ? results : [results];

        list.forEach((quote: any) => {
            if (!quote || !quote.symbol) return;
            const symbol = quote.symbol.replace('.NS', '').replace('.BO', '');
            if (quote.regularMarketPrice) {
                priceMap.set(symbol, quote.regularMarketPrice);
            }
        });
    } catch (error) {
        console.error('Yahoo Finance Error:', error);
    }
    return priceMap;
};

// Google Finance Scraping (P/E & Earnings)
const scrapeGoogleFinance = async (symbol: string): Promise<Partial<StockData>> => {
    try {
        const url = `https://www.google.com/finance/quote/${symbol}:NSE`;

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        // Selectors are volatile; searching by text labels.
        let pe = 'N/A';
        let earnings = 'N/A';

        $('div').each((i, el) => {
            const text = $(el).text();
            if (text === 'P/E ratio') {
                pe = $(el).next().text();
            }
            if (text === 'EPS (TTM)') {
                earnings = $(el).next().text();
            }
        });

        return { pe, earnings };

    } catch (error) {
        // console.warn(`Failed to scrape Google Finance for ${symbol}`, error instanceof Error ? error.message : error);
        return { pe: 'N/A', earnings: 'N/A' };
    }
};

export const getPortfolioData = async () => {
    const portfolio = getStaticPortfolio();
    const symbols = [...new Set(portfolio.map(p => p.symbol))];

    // 1. Fetch Prices (Yahoo)
    const priceMap = await fetchYahooPrices(symbols);

    // 2. Fetch Fundamentals (Google)
    const fundamentalsPromises = symbols.map(async (symbol) => {
        const data = await scrapeGoogleFinance(symbol);
        return { symbol, ...data };
    });

    // Parallel execution
    const fundamentalsList = await Promise.all(fundamentalsPromises);
    const fundamentalsMap = new Map(fundamentalsList.map(f => [f.symbol, f]));

    // 3. Aggregate Data
    let totalPortfolioValue = 0;

    const enrichedPortfolio = portfolio.map(item => {
        const cmp = priceMap.get(item.symbol) || 0;
        const fund = fundamentalsMap.get(item.symbol);

        const investment = item.purchasePrice * item.quantity;
        const presentValue = cmp > 0 ? cmp * item.quantity : 0;

        const gainLoss = presentValue > 0 ? presentValue - investment : 0;
        const gainLossPercent = (investment > 0 && presentValue > 0) ? (gainLoss / investment) * 100 : 0;

        if (presentValue > 0) {
            totalPortfolioValue += presentValue;
        }

        return {
            ...item,
            cmp,
            presentValue: presentValue > 0 ? presentValue : 0,
            investment,
            gainLoss: presentValue > 0 ? gainLoss : 0,
            gainLossPercent,
            pe: fund?.pe || 'N/A',
            earnings: fund?.earnings || 'N/A'
        };
    });

    // Calculate Portfolio Percent
    const finalPortfolio = enrichedPortfolio.map(item => ({
        ...item,
        portfolioPercent: totalPortfolioValue > 0 ? (item.presentValue / totalPortfolioValue) * 100 : 0
    }));

    return {
        portfolio: finalPortfolio,
        totalValue: totalPortfolioValue,
        lastUpdated: new Date().toISOString()
    };
};

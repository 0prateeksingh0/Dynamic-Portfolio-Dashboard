export interface PortfolioItem {
    id: number;
    name: string;
    purchasePrice: number;
    quantity: number;
    symbol: string;
    sector: string;

    // Calculated / Fetched fields
    cmp?: number;
    presentValue?: number;
    gainLoss?: number;
    gainLossPercent?: number;
    pe?: number | string;
    earnings?: number | string;
    investment?: number;
    portfolioPercent?: number;
}

export interface StockData {
    symbol: string;
    price?: number;
    pe?: number | string;
    earnings?: number | string;
}

export type SectorSummary = {
    sector: string;
    totalInvestment: number;
    totalPresentValue: number;
    gainLoss: number;
}

"use client";

import useSWR from 'swr';
import { PortfolioTable } from '@/components/PortfolioTable';
import { SectorSummary, PortfolioItem } from '@/types';
import { useMemo } from 'react';
import { RotateCw, Loader2, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ApiResponse {
  portfolio: PortfolioItem[];
  totalValue: number;
  lastUpdated: string;
}

export default function Home() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>('/api/portfolio', fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: false
  });

  const sectorSummaries = useMemo<SectorSummary[]>(() => {
    if (!data?.portfolio) return [];

    const groups = new Map<string, SectorSummary>();

    data.portfolio.forEach(item => {
      const existing = groups.get(item.sector) || {
        sector: item.sector,
        totalInvestment: 0,
        totalPresentValue: 0,
        gainLoss: 0
      };

      existing.totalInvestment += item.investment || 0;
      existing.totalPresentValue += (item.presentValue || 0);
      existing.gainLoss += (item.gainLoss || 0);

      groups.set(item.sector, existing);
    });

    return Array.from(groups.values());
  }, [data]);

  const totalInvestment = data?.portfolio.reduce((acc, cur) => acc + (cur.investment || 0), 0) || 0;
  const totalGainLoss = (data?.totalValue || 0) - totalInvestment;

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-background text-red-400">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
        <p>Failed to fetch portfolio data.</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen p-4 md:p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Portfolio
            </h1>
            <p className="text-muted-foreground mt-1">Real-time market performance</p>
          </div>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card border border-border rounded-lg hover:bg-muted transition-colors text-foreground"
          >
            <RotateCw size={14} /> Refresh
          </button>
        </div>

        {/* Top Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Investment */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-background rounded-full text-muted-foreground">
                  <Wallet size={16} />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Invested</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalInvestment)}
              </div>
            </div>

            {/* Current Value */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-background rounded-full text-muted-foreground">
                  <DollarSign size={16} />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Current Value</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.totalValue)}
              </div>
            </div>

            {/* Gain/Loss Absolute */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-background rounded-full text-muted-foreground">
                  {totalGainLoss >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <span className="text-sm text-muted-foreground font-medium">Total Returns</span>
              </div>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalGainLoss >= 0 ? "+" : ""}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalGainLoss)}
              </div>
            </div>

            {/* Gain/Loss Percent */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-background rounded-full text-muted-foreground">
                  <span className="text-xs font-bold">%</span>
                </div>
                <span className="text-sm text-muted-foreground font-medium">Return %</span>
              </div>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalInvestment > 0 ? (
                  <> {totalGainLoss >= 0 ? "+" : ""}{((totalGainLoss / totalInvestment) * 100).toFixed(2)}%</>
                ) : "0.00%"}
              </div>
            </div>
          </div>
        )}
      </header>

      {isLoading && !data ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-muted-foreground" size={48} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Sector Highlights */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Sector Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sectorSummaries.map(sector => (
                <div key={sector.sector} className="bg-card border border-border p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-foreground truncate max-w-[70%]" title={sector.sector}>{sector.sector}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${sector.gainLoss >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {sector.gainLoss >= 0 ? "+" : ""}{((sector.gainLoss / sector.totalInvestment) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-mono text-foreground">
                        {new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short', style: 'currency', currency: 'INR' }).format(sector.totalPresentValue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gain</span>
                      <span className={`font-mono ${sector.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {sector.gainLoss >= 0 ? "+" : ""}{new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short' }).format(sector.gainLoss)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Holdings</h3>
            <PortfolioTable data={data!.portfolio} lastUpdated={data!.lastUpdated} />
          </div>
        </div>
      )}
    </main>
  );
}

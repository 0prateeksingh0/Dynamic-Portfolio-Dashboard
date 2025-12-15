import { NextResponse } from 'next/server';
import { getPortfolioData } from '@/lib/stock-service';

export const dynamic = 'force-dynamic'; // Disable static caching

export async function GET() {
    try {
        const data = await getPortfolioData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
    }
}

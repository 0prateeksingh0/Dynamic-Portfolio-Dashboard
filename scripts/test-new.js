const YahooFinance = require('yahoo-finance2').default;

(async () => {
    try {
        console.log('Type of default export:', typeof YahooFinance);
        const yf = new YahooFinance();
        console.log('Instantiated successfully.');
        console.log('Fetching HDFCBANK.NS...');
        const res = await yf.quote('HDFCBANK.NS');
        console.log('Result:', res.regularMarketPrice);
    } catch (e) {
        console.error('Error:', e);
    }
})();

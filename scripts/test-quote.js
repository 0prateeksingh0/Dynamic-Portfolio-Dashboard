const yf = require('yahoo-finance2').default;

(async () => {
    try {
        console.log('Fetching HDFCBANK.NS...');
        const res = await yf.quote('HDFCBANK.NS');
        console.log('Result:', res.regularMarketPrice);
    } catch (e) {
        console.error('Error:', e);
    }
})();

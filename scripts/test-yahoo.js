const yf = require('yahoo-finance2');
console.log('Keys:', Object.keys(yf));
console.log('Default keys:', yf.default ? Object.keys(yf.default) : 'No default');
if (yf.YahooFinance) console.log('YahooFinance is exported directly');
if (yf.default && yf.default.YahooFinance) console.log('YahooFinance is on default');

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../data/E555815F_58D029050B.xlsx');
const outputPath = path.join(__dirname, '../data/portfolio.json');

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let currentSector = 'Unknown';
    const portfolio = [];

    // Iterate data, skipping header row (index 0)

    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        // Sector Row: No ID, has Particulars text
        if (!row['__EMPTY'] && row['__EMPTY_1']) {
            currentSector = row['__EMPTY_1'];
            continue;
        }

        // Stock Row: Has distinct numeric ID
        if (row['__EMPTY'] && typeof row['__EMPTY'] === 'number') {
            portfolio.push({
                id: row['__EMPTY'],
                name: row['__EMPTY_1'],
                purchasePrice: row['__EMPTY_2'],
                quantity: row['__EMPTY_3'],
                symbol: row['__EMPTY_6'],
                sector: currentSector
            });
        }
    }

    fs.writeFileSync(outputPath, JSON.stringify(portfolio, null, 2));
    console.log(`Successfully generated portfolio.json with ${portfolio.length} items at ${outputPath}`);

} catch (error) {
    console.error('Error generating portfolio:', error);
}

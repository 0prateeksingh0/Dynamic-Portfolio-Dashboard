const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../../E555815F_58D029050B.xlsx');
console.log('Reading file from:', filePath);

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log('Columns:', Object.keys(data[0] || {}));
    console.log('First Row:', data[0]);
    console.log('Total Rows:', data.length);
    console.log('Sample Data:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
} catch (error) {
    console.error('Error reading excel:', error);
}

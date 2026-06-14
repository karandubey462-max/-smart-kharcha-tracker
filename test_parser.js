// Quick test of the PhonePe parser
import fs from 'fs';

// Simplified version of the parser
function parsePhonePeStatement(text) {
  console.log('📱 Parsing PhonePe formatted statement...');
  const lines = text.split('\n').map(l => l.trim().replace(/^"|"$/g, ''));
  const txns = [];
  
  let lineIndex = 0;
  
  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    
    // Skip header lines, page numbers, disclaimers
    if (!line || 
        line.includes('Transaction Statement for') ||
        line.includes('This is a system generated') ||
        line.includes('Page ') ||
        line.includes('Date            Transaction Details')) {
      lineIndex++;
      continue;
    }
    
    // Check if this line starts a transaction (contains date pattern)
    const dateMatch = line.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/);
    
    if (dateMatch) {
      const [month, day, year] = [dateMatch[1], dateMatch[2], dateMatch[3]];
      const monthNum = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      }[month];
      const date = `${year}-${monthNum}-${day.padStart(2, '0')}`;
      
      // Extract description, type, and amount from the same line
      const restOfLine = line.substring(dateMatch[0].length).trim();
      const parts = restOfLine.split(/\s{2,}/).filter(p => p.trim());
      
      let description = '';
      let type = 'expense';
      let amount = 0;
      
      if (parts.length >= 2) {
        const amountStr = parts[parts.length - 1];
        amount = parseFloat(amountStr.replace(/[₹,\s]/g, '')) || 0;
        
        const typeStr = parts[parts.length - 2];
        if (typeStr && typeStr.toUpperCase().includes('CREDIT')) {
          type = 'income';
        }
        
        description = parts.slice(0, parts.length - 2).join(' ');
      }
      
      if (amount > 0 && description) {
        txns.push({
          date,
          description: description.trim(),
          amount,
          type
        });
        console.log(`✅ Found: ${date} | ${description} | ${type} | ₹${amount}`);
      }
    }
    
    lineIndex++;
  }
  
  console.log(`\n✅ Total transactions parsed: ${txns.length}`);
  return txns;
}

// Test the parser
const csvContent = fs.readFileSync('test_phonepe.csv', 'utf8');
console.log('File length:', csvContent.length);
console.log('\n--- Starting Parse ---\n');
const result = parsePhonePeStatement(csvContent);
console.log('\n--- Result ---');
console.log(JSON.stringify(result, null, 2));

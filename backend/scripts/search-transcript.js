const fs = require('fs');

const transcriptPath = 'C:\\Users\\tnanh\\.gemini\\antigravity-cli\\brain\\42c2f27b-8f82-49e4-959b-787094d800d8\\.system_generated\\logs\\transcript.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');
0
for (let i = 390; i < 400; i++) {
  if (i < lines.length) {
    try {
      const parsed = JSON.parse(lines[i]);
      console.log(`================ LINE ${i} ================`);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(`Failed to parse line ${i}`);
    }
  }
}

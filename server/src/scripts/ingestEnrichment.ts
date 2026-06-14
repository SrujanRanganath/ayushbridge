import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AyurvedicEnrichment from '../models/AyurvedicEnrichment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅ MongoDB connected');

  const csvPath = path.resolve(__dirname, '../../../data/ayurvedic_enrichment.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',');
  const records: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const row: any = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').replace(/^"|"$/g, '').trim();
    });
    const disease = row['Disease'];
    if (!disease) continue;
    records.push({
      disease,
      hindiName: row['Hindi Name'] || '',
      symptoms: row['Symptoms'] || '',
      doshas: row['Doshas'] || '',
      ayurvedicHerbs: row['Ayurvedic Herbs'] || '',
      formulation: row['Formulation'] || '',
      dietRecommendations: row['Diet and Lifestyle Recommendations'] || '',
      yogaTherapy: row['Yoga & Physical Therapy'] || '',
      prognosis: row['Prognosis'] || '',
    });
  }

  console.log(`📄 Read ${records.length} valid records`);

  try {
    const result = await AyurvedicEnrichment.insertMany(records, { ordered: false });
    console.log(`✅ Inserted ${result.length} records`);
  } catch (err: any) {
    const inserted = err?.result?.nInserted ?? 0;
    console.log(`✅ Inserted ${inserted} records (duplicates skipped)`);
  }

  await mongoose.disconnect();
  console.log('✅ Done');
}

main();
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse';
import ICD11Code from '../models/ICD11Code.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅ MongoDB connected');

  const csvPath = path.resolve(__dirname, '../../../data/ICD-11.csv');
  const records: { code: string; title: string }[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (row: any) => {
        const code = row['Code']?.trim();
        const title = row['Title']?.trim();
        if (code && title) {
          records.push({ code, title });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`📄 Read ${records.length} rows from ICD-11.csv`);

  try {
    const result = await ICD11Code.insertMany(records, { ordered: false });
    console.log(`✅ ICD11: inserted ${result.length} records`);
  } catch (err: any) {
    const inserted = err?.result?.nInserted ?? 0;
    console.log(`✅ ICD11: inserted ${inserted} records (duplicates skipped)`);
  }

  await mongoose.disconnect();
  console.log('✅ MongoDB disconnected');
}

main();
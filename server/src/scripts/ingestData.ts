import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { parse } from 'csv-parse/sync';
import NAMASTECode from '../models/NAMASTECode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '../../.env') });

const DATA_DIR = path.join(__dirname, '../../../data');

interface CsvFileConfig {
  filename: string;
  mapRow: (row: Record<string, string>) => {
    code: string;
    name: string;
    category: string;
    description?: string;
  } | null;
}

const csvFiles: CsvFileConfig[] = [
  {
    filename: 'namaste_ayurveda_morbidity.csv',
    mapRow: (row) => {
      const code = row.NAMC_CODE?.trim();
      const name = row.NAMC_term?.trim();
      if (!code || !name) return null;
      const description = row.Long_definition?.trim();
      return {
        code,
        name,
        category: 'Ayurveda',
        ...(description && description !== '-' ? { description } : {}),
      };
    },
  },
  {
    filename: 'namaste_siddha_morbidity.csv',
    mapRow: (row) => {
      const code = row.NAMC_CODE?.trim();
      const name = row.NAMC_TERM?.trim();
      if (!code || !name) return null;
      const description = row.Short_definition?.trim();
      return {
        code,
        name,
        category: 'Siddha',
        ...(description && description !== '-' ? { description } : {}),
      };
    },
  },
  {
    filename: 'namaste_unani_morbidity.csv',
    mapRow: (row) => {
      const code = row.NUMC_CODE?.trim();
      const name = row.NUMC_TERM?.trim() || row.Short_definition?.trim();
      if (!code || !name) return null;
      const description = row.Short_definition?.trim();
      return {
        code,
        name,
        category: 'Unani',
        ...(description && description !== '-' ? { description } : {}),
      };
    },
  },
];

async function ingestFile(config: CsvFileConfig): Promise<void> {
  const filePath = path.join(DATA_DIR, config.filename);
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const documents = rows
    .map(config.mapRow)
    .filter((doc): doc is NonNullable<typeof doc> => doc !== null);

  try {
    const result = await NAMASTECode.insertMany(documents, { ordered: false });
    console.log(`✅ ${config.filename}: inserted ${result.length} records`);
  } catch (error) {
    if (error instanceof mongoose.mongo.MongoBulkWriteError) {
      const inserted = error.insertedDocs?.length ?? 0;
      console.log(
        `✅ ${config.filename}: inserted ${inserted} records (duplicates skipped)`
      );
    } else {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected');

    for (const config of csvFiles) {
      await ingestFile(config);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
}

main();

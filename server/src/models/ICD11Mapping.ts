import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IICD11Mapping extends Document {
  namasteCode: string;
  icd11Code: string;
  icd11Title: string;
  confidence: number;
  cachedAt: Date;
}

const icd11MappingSchema = new Schema<IICD11Mapping>({
  namasteCode: { type: String, required: true, unique: true },
  icd11Code: { type: String, required: true },
  icd11Title: { type: String, required: true },
  confidence: { type: Number, required: true },
  cachedAt: { type: Date, default: Date.now },
});

const ICD11Mapping: Model<IICD11Mapping> = mongoose.model<IICD11Mapping>(
  'ICD11Mapping',
  icd11MappingSchema
);

export default ICD11Mapping;

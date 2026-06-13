import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IICD11Code extends Document {
  code: string;
  title: string;
}

const icd11CodeSchema = new Schema<IICD11Code>({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
});

icd11CodeSchema.index({ title: 'text' });

const ICD11Code: Model<IICD11Code> = mongoose.model<IICD11Code>(
  'ICD11Code',
  icd11CodeSchema
);

export default ICD11Code;
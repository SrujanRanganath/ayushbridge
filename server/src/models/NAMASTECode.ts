import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INAMASTECode extends Document {
  code: string;
  name: string;
  category: string;
  description?: string;
  createdAt: Date;
}

const namasteCodeSchema = new Schema<INAMASTECode>({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

namasteCodeSchema.index({ name: 'text' });

const NAMASTECode: Model<INAMASTECode> = mongoose.model<INAMASTECode>(
  'NAMASTECode',
  namasteCodeSchema
);

export default NAMASTECode;

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFHIRBundle extends Document {
  patientId: string;
  namasteCode: string;
  icd11Code: string;
  bundleJSON: Record<string, unknown>;
  generatedAt: Date;
  auditLog?: string;
}

const fhirBundleSchema = new Schema<IFHIRBundle>({
  patientId: { type: String, required: true },
  namasteCode: { type: String, required: true },
  icd11Code: { type: String, required: true },
  bundleJSON: { type: Schema.Types.Mixed, required: true },
  generatedAt: { type: Date, default: Date.now },
  auditLog: { type: String },
});

const FHIRBundle: Model<IFHIRBundle> = mongoose.model<IFHIRBundle>(
  'FHIRBundle',
  fhirBundleSchema
);

export default FHIRBundle;

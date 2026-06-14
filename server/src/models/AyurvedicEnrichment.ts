import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAyurvedicEnrichment extends Document {
  disease: string;
  hindiName?: string;
  symptoms?: string;
  doshas?: string;
  ayurvedicHerbs?: string;
  formulation?: string;
  dietRecommendations?: string;
  yogaTherapy?: string;
  prognosis?: string;
  createdAt: Date;
}

const ayurvedicEnrichmentSchema = new Schema<IAyurvedicEnrichment>({
  disease: { type: String, required: true, unique: true },
  hindiName: { type: String },
  symptoms: { type: String },
  doshas: { type: String },
  ayurvedicHerbs: { type: String },
  formulation: { type: String },
  dietRecommendations: { type: String },
  yogaTherapy: { type: String },
  prognosis: { type: String },
  createdAt: { type: Date, default: Date.now },
});

ayurvedicEnrichmentSchema.index({ disease: 'text' });

const AyurvedicEnrichment: Model<IAyurvedicEnrichment> = mongoose.model<IAyurvedicEnrichment>(
  'AyurvedicEnrichment',
  ayurvedicEnrichmentSchema
);

export default AyurvedicEnrichment;
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'clinician' | 'admin';
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['clinician', 'admin'], default: 'clinician' },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
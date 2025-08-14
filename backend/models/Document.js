import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    data: { type: Object, default: {} },
    title: { type: String, default: 'Untitled Document' },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

export default mongoose.model('Document', DocumentSchema);

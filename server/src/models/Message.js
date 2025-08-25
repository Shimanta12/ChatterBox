import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'voice'], default: 'text' },
  audioUrl: { type: String },
  audioDuration: { type: Number }, // Duration in seconds
  delivered: { type: Boolean, default: false },
  read: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ from: 1, to: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);

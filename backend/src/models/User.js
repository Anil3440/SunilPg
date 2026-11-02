const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'STUDENT'], default: 'STUDENT' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', default: null },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Never return password hash
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  // passwordHash field is set from outside; only hash if it looks like plain text
  next();
});

module.exports = mongoose.model('User', userSchema);


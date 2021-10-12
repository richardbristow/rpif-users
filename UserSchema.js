const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: { type: String, required: true },
    password: {
      type: String,
      select: false,
      required: true,
    },
    active: { type: Boolean, required: true },
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model('User', userSchema);

module.exports = User;

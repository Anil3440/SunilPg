const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 }, // 0 = included in daily hostel food plan, > 0 = extra paid snack/dish
  isAvailable: { type: Boolean, default: true },
  description: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'BEVERAGES'], 
    default: 'SNACKS' 
  },
  imageUrl: { type: String, default: '' },
});

const menuItemSchema = new mongoose.Schema(
  {
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    mealType: { 
      type: String, 
      enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS', 'BEVERAGES'], 
      required: true 
    },
    items: [{ type: String, trim: true }], // String list for quick menu display
    detailedItems: [foodItemSchema],       // Detailed list for online ordering
  },
  { timestamps: true }
);

menuItemSchema.index({ branch: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);

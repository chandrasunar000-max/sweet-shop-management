
const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    type: {
      type: String,
      enum: ["restock", "sale", "return", "adjustment"],
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number"
      }
    },

    previousStock: {
      type: Number,
      required: true,
      min: 0
    },

    newStock: {
      type: Number,
      required: true,
      min: 0
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null
    },

    note: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);

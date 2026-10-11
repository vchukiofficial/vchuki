import mongoose, { Schema, Document } from 'mongoose'

export type StockReason =
  | 'restock'          // new stock received
  | 'correction'       // manual count fix
  | 'store_sale'       // sold at the shop counter
  | 'online_order'     // website order placed
  | 'order_restored'   // order cancelled / returned / deleted
  | 'damaged'          // written off

export interface IStockMovement extends Document {
  variant: mongoose.Types.ObjectId
  product?: mongoose.Types.ObjectId
  change: number
  balanceAfter: number
  reason: StockReason
  order?: mongoose.Types.ObjectId
  note?: string
  by?: string
}

// Append-only ledger: every change to ProductVariant.stock writes one row here.
const StockMovementSchema: Schema = new Schema({
  variant: { type: Schema.Types.ObjectId, ref: 'ProductVariant', required: true, index: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  change: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  reason: { type: String, enum: ['restock', 'correction', 'store_sale', 'online_order', 'order_restored', 'damaged'], required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  note: String,
  by: String,
}, { timestamps: true })

export default mongoose.models.StockMovement || mongoose.model<IStockMovement>('StockMovement', StockMovementSchema)

import mongoose, { Document, Model, Schema } from 'mongoose'
import uuid from 'uuid/v4'

export interface InventoriesRecord {
  name: string
  description: string
  uuid: string
  price: number
  quantity: number
  createdAt: Date
  deletedAt: Date
}

export interface InventoriesModel extends InventoriesRecord, Document {
}

const InventoriesSchema: Schema = new Schema({
  name: { type: String, unique: true, dropDups: true, required: true },
  uuid: { type: String, default: uuid, unique: true, dropDups: true, required: true },
  description: { type: String },
  price: { type: Number, min: 0 },
  quantity: { type: Number },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }
}).index({ uuid: 1 })

export const Inventories: Model<InventoriesModel> = mongoose.model<InventoriesModel>('Inventories', InventoriesSchema)

import mongoose, { Document, Model, Schema } from 'mongoose'
import uuid from 'uuid/v4'

export enum OrderStatus {
  Placed = 'PLACED',
  Cancelled = 'CANCELLED'
}

export interface OrdersItem { uuid: string, quantity: number }

export interface OrdersRecord {
  email: string
  uuid: string
  items: OrdersItem[]
  status: OrderStatus
  createdAt: Date
  deletedAt: Date
}

export interface OrdersModel extends OrdersRecord, Document {
}

const OrdersItemSchema = new Schema({
  uuid: { type: String },
  quantity: { type: Number, min: 1 }
})

const OrdersSchema = new Schema({
  email: { type: String, required: true },
  uuid: { type: String, default: uuid, unique: true, dropDups: true, required: true },
  items: [{ type: OrdersItemSchema }],
  status: { type: String, enum: ['PLACED', 'CANCELLED'], default: 'PLACED' },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date }
}).index({ uuid: 1 })

export const Orders: Model<OrdersModel> = mongoose.model<OrdersModel>('Orders', OrdersSchema)

import uuid from 'uuid/v4'
import mongoose, { Schema } from 'mongoose'

export interface ModelMap {
    Inventories: Schema
}

const InventoriesSchema = new Schema({
    name: { type: String, unique : true, dropDups: true, required: true },
    uuid: { type: String, default: uuid, unique : true, dropDups: true, required: true },
    description: { type: String },
    price: { type: Number, min: 0 },
    quantity: { type: Number },
}).index({ uuid: 1 })

export const Inventories = mongoose.model('Inventories', InventoriesSchema)


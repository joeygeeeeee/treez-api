import { Router } from 'express'
import { map, pluck } from 'ramda'
import { ValidatedRequest, ValidatedRequestSchema } from 'express-joi-validation'

import {
    ordersResourceIdentifierValidator,
    OrdersResourceRequestSchema,

    OrderResourceIdentifierRequestSchema,

    ordersResourceValidator,

    ordersResourceUpdateValidator,
    OrdersResourceUpdateSchema
} from "./schemas"

import {Inventories, InventoriesModel, Orders, OrdersItem, OrdersModel, OrdersRecord} from "../../models"

const router = Router()

const pluckOrdersProps: (record: any) => OrdersRecord =
    ({ email, items, uuid, status, createdAt, deletedAt }) =>
        ({
            email,
            uuid,
            items: items.map(({ uuid, quantity }: OrdersItem) => ({ uuid, quantity })),
            status,
            createdAt,
            deletedAt
        })

class NotEnoughStockError extends Error {}

router.post(
    '/',
    ordersResourceValidator,
    async (request: ValidatedRequest<OrdersResourceRequestSchema>, response): Promise<void> => {
        const order: OrdersModel = new Orders(request.body)
        await order.save()

        const doc = order.toJSON()

        try {
            await Promise.all(doc.items.map(async ({ uuid, quantity }: OrdersItem) => {
                const item: InventoriesModel = await Inventories.findOne({ uuid })

                if (quantity > item.quantity) {
                    throw new NotEnoughStockError()
                }

                await Inventories.updateOne(
                    { uuid },
                    { $inc: { quantity: -quantity } }
                )
            }))
            response.status(201).send({ uuid: doc.uuid })
        } catch (e) {
            response.sendStatus(400)
        }
    }
)

router.get(
    '/',
    async (request: ValidatedRequest<ValidatedRequestSchema>, response): Promise<void> => {
        response.send(await Orders.find({ deletedAt: { $exists: false } }).sort({ createdAt: -1 }))
    }
)

router.get(
    '/:uuid',
    ordersResourceIdentifierValidator,
    async (request: ValidatedRequest<OrderResourceIdentifierRequestSchema>, response): Promise<void> => {
        const record: OrdersModel = await Orders.findOne({ ...request.params, deletedAt: { $exists: false } })

        if (!record) {
            response.sendStatus(404)
            return
        }

        response.send(pluckOrdersProps(record.toJSON()))
    }
)

router.put(
    '/:uuid',
    ordersResourceIdentifierValidator,
    ordersResourceUpdateValidator,
    async (request: ValidatedRequest<OrdersResourceUpdateSchema>, response): Promise<void> => {
        const order = await Orders.findOne({ uuid: request.params.uuid })

        if (order.status !== request.body.status) { // Has already been cancelled and stock adjusted for
            await Promise.all(order.items.map(async ({ uuid, quantity }: OrdersItem) => {
                await Inventories.updateOne(
                    { uuid },
                    { $inc: { quantity } }
                )
            }))
        }

        await Orders.updateOne({ uuid: request.params.uuid }, { $set: request.body })
        response.sendStatus(200)
    }
)

router.delete(
    '/:uuid',
    ordersResourceIdentifierValidator,
    async (request: ValidatedRequest<OrderResourceIdentifierRequestSchema>, response): Promise<void> => {
        await Orders.updateOne({ uuid: request.params.uuid }, { $set: { deletedAt: new Date() } })

        const order = await Orders.findOne({ uuid: request.params.uuid })

        if (order.status !== 'CANCELLED') { // Has already been cancelled and stock adjusted for
            await Promise.all(order.items.map(async ({ uuid, quantity }: OrdersItem) => {
                await Inventories.updateOne(
                    { uuid },
                    { $inc: { quantity } }
                )
            }))
        }

        response.sendStatus(200)
    }
)

export default router
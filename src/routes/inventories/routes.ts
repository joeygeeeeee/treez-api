import { Router } from 'express'
import { ValidatedRequest, ValidatedRequestSchema } from 'express-joi-validation'

import {
    inventoriesResourceValidator,
    InventoriesResourceRequestSchema,

    inventoriesResourceIdentifierValidator,
    InventoriesResourceIdentifierRequestSchema,

    InventoriesResourceUpdateSchema
} from "./schemas"

import {Inventories, InventoriesModel, InventoriesRecord, Orders} from "../../models"

const router = Router()

const pluckInventoriesProps: (record: any) => InventoriesRecord =
    ({ name, description, price, quantity, uuid, createdAt, deletedAt }) =>
        ({ name, description, price, quantity, uuid, createdAt, deletedAt })

router.post(
    '/',
    inventoriesResourceValidator,
    async (request: ValidatedRequest<InventoriesResourceRequestSchema>, response): Promise<void> => {
        const inventory: InventoriesModel = new Inventories(request.body)
        await inventory.save()
        const doc = inventory.toJSON()
        response.status(201).send({ uuid: doc.uuid })
    }
)

router.get(
    '/',
    async (request: ValidatedRequest<ValidatedRequestSchema>, response): Promise<void> => {
        response.send(await Inventories.find({ deletedAt: { $exists: false } }).sort({ createdAt: 1 }))
    }
)

router.get(
    '/:uuid',
    inventoriesResourceIdentifierValidator,
    async (request: ValidatedRequest<InventoriesResourceIdentifierRequestSchema>, response): Promise<void> => {
        const record: InventoriesModel = await Inventories.findOne({ ...request.params, deletedAt: { $exists: false } })

        if (!record) {
            response.sendStatus(404)
            return
        }

        response.send(pluckInventoriesProps(record.toJSON()))
    }
)

router.put(
    '/:uuid',
    inventoriesResourceIdentifierValidator,
    inventoriesResourceValidator,
    async (request: ValidatedRequest<InventoriesResourceUpdateSchema>, response): Promise<void> => {
        const result = await Inventories.updateOne({ uuid: request.params.uuid }, { $set: request.body })
        response.sendStatus(200)
    }
)

router.delete(
    '/:uuid',
    inventoriesResourceIdentifierValidator,
    async (request: ValidatedRequest<InventoriesResourceIdentifierRequestSchema>, response): Promise<void> => {
        await Inventories.updateOne({ uuid: request.params.uuid }, { $set: { deletedAt: new Date() } })
        response.sendStatus(200)
    }
)

export default router
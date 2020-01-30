import { Router } from 'express'
import {ValidatedRequest, ValidatedRequestSchema} from 'express-joi-validation'

import {
    inventoriesResourceValidator,
    InventoriesResourceRequestSchema,

    inventoriesResourceIdentifierValidator,
    InventoriesResourceIdentifierRequestSchema,

    InventoriesResourceUpdateSchema
} from "./schemas"

import { Inventories } from "../../models"

const router = Router()

router.post(
    '/',
    inventoriesResourceValidator,
    async (request: ValidatedRequest<InventoriesResourceRequestSchema>, response): Promise<void> => {
        const inventory = new Inventories(request.body)
        await inventory.save()
        const doc = inventory.toJSON()
        response.status(201).send({ uuid: doc.uuid })
    }
)

router.get(
    '/',
    async (request: ValidatedRequest<ValidatedRequestSchema>, response): Promise<void> => {
        response.send(await Inventories.find({}))
    }
)

router.get(
    '/:uuid',
    inventoriesResourceIdentifierValidator,
    async (request: ValidatedRequest<InventoriesResourceIdentifierRequestSchema>, response): Promise<void> => {
        response.send(await Inventories.findOne(request.params))
    }
)

router.put(
    '/:uuid',
    inventoriesResourceIdentifierValidator,
    inventoriesResourceValidator,
    async (request: ValidatedRequest<InventoriesResourceUpdateSchema>, response): Promise<void> => {
        const result = await Inventories.updateOne({ uuid: request.params.uuid }, { $set: request.body })
        console.log(result)
        response.sendStatus(200)
    }
)

export default router
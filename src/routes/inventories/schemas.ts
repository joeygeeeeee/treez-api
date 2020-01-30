import * as Joi from '@hapi/joi'
import { ContainerTypes, ValidatedRequestSchema, createValidator } from 'express-joi-validation'

const validator = createValidator()

export const inventoriesResourceValidator = validator.body(Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0),
    quantity: Joi.number()
}))

export interface InventoriesResourceRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        name: string
        description: string
        price: number
        quantity: number
    }
}


export const inventoriesResourceIdentifierValidator = validator.params(Joi.object({
    uuid: Joi.string().guid()
}))

export interface InventoriesResourceIdentifierRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Params]: {
        uuid: string
    }
}

export interface InventoriesResourceUpdateSchema extends ValidatedRequestSchema {
    [ContainerTypes.Params]: {
        uuid: string
    },
    [ContainerTypes.Body]: {
        name: string
        description: string
        price: number
        quantity: number
    }
}
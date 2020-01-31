import * as Joi from '@hapi/joi'
import { ContainerTypes, ValidatedRequestSchema, createValidator } from 'express-joi-validation'
import { OrderStatus } from "../../models";

const validator = createValidator()

export const ordersResourceValidator = validator.body(Joi.object({
    email: Joi.string().required(),
    items: Joi.array().items(
        Joi.object({
            uuid: Joi.string().required(),
            quantity: Joi.number().required()
        })
    ).required()
}))

export interface OrdersResourceRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        email: string
        items: { uuid: string, quantity: number}[]
    }
}

export const ordersResourceIdentifierValidator = validator.params(Joi.object({
    uuid: Joi.string().guid()
}))

export interface OrderResourceIdentifierRequestSchema extends ValidatedRequestSchema {
    [ContainerTypes.Params]: {
        uuid: string
    }
}

export const ordersResourceUpdateValidator = validator.body(Joi.object({
    status: Joi.string().valid('CANCELLED').required(),
}))

export interface OrdersResourceUpdateSchema extends ValidatedRequestSchema {
    [ContainerTypes.Body]: {
        status: OrderStatus
    }
}
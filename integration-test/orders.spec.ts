import { SuperTest, Test } from 'supertest'

import {Inventories, Orders, OrdersRecord} from "../src/models"

import items from '../mock-data/inventories.json'
import { clearDatabase, destroyApp, getApp } from "./app";
import uuid = require("uuid");

let request: SuperTest<Test>

const populateInventory = () => Promise.all(items.map((i: object) => new Inventories(i).save()))

beforeAll(async () => {
    request = await getApp()
})

beforeEach(async () => {
    await clearDatabase()
    await populateInventory()
})

afterAll(async () => {
    await destroyApp()
})

describe('/orders', () => {
    describe('#GET', () => {
        it('200 - Should get an order', async () => {
            const stock = (await Inventories.find({})).map((s) => s.toJSON())

            const order = new Orders({
                email: 'test@test.com',
                items: [
                    { uuid: stock[0].uuid, quantity: 1 },
                    { uuid: stock[1].uuid, quantity: 2 }
                ]
            })

            await order.save()
            const record = order.toJSON()

            const { body } = await request
                .get(`/orders/${record.uuid}`)
                .expect(200)

            expect(body).toMatchObject({
                email: 'test@test.com',
                status: 'PLACED',
                items: [
                    { uuid: stock[0].uuid, quantity: 1 },
                    { uuid: stock[1].uuid, quantity: 2 }
                ]
            })

            expect(body).toHaveProperty('createdAt')
            expect(body).toHaveProperty('uuid')
        })

        it('200 - Should get orders', async () => {
            const stock = (await Inventories.find({})).map((s) => s.toJSON())

            const orders = [
                {
                    email: 'test@test.com',
                    items: [
                        { uuid: stock[0].uuid, quantity: 1 },
                        { uuid: stock[1].uuid, quantity: 2 }
                    ]
                },
                {
                    email: 'test@test.com',
                    items: [
                        { uuid: stock[0].uuid, quantity: 1 },
                        { uuid: stock[1].uuid, quantity: 2 }
                    ]
                }
            ]

            await Promise.all(orders.map(order => new Orders(order).save()))

            const { body } = await request
                .get(`/orders`)
                .expect(200)

            expect(body).toHaveLength(orders.length)

            orders.forEach((order, i) => {
                expect(body[i]).toMatchObject(order)
            })
        })

        it('404 - Should respond not found if uuid is not found', async () => {
            const { body } = await request
                .get(`/orders/${uuid()}`)
                .expect(404)
        })
    })

    describe('#POST', () => {
        it('201 - Should create an order', async () => {
            const stock = (await Inventories.find({})).map((s) => s.toJSON())

            const order = {
                email: 'test@test.com',
                items: [
                    { uuid: stock[0].uuid, quantity: 1 },
                    { uuid: stock[1].uuid, quantity: 2 }
                ]
            }

            const { body } = await request
                .post(`/orders`)
                .send(order)
                .expect(201)

            expect(body).toHaveProperty('uuid')

            const stockAfterOrder = (await Inventories.find({})).map((s) => s.toJSON())

            expect(stockAfterOrder[0].quantity).toBe(stock[0].quantity - 1)
            expect(stockAfterOrder[1].quantity).toBe(stock[1].quantity - 2)
        })

        it('400 - Should not create an order (out of stock)', async () => {
            const stock = (await Inventories.find({})).map((s) => s.toJSON())

            const order = {
                email: 'test@test.com',
                items: [
                    { uuid: stock[0].uuid, quantity: stock[0].quantity + 1 },
                    { uuid: stock[1].uuid, quantity: 2 }
                ]
            }

            await request
                .post(`/orders`)
                .send(order)
                .expect(400)
        })

        it.each([
            [
                {
                    email: 'test@test.com',
                    items: [
                        { uuid: uuid() },
                        { uuid: uuid(), quantity: 2 }
                    ]
                },
                {
                    email: 'test@test.com',
                    items: [
                        { uuid: uuid(), quantity: 0 }
                    ]
                },
                {
                    items: [
                        { uuid: uuid(), quantity: 1 }
                    ]
                }
            ]
        ])('400 - Should reject bad payloads', async (item) => {
            await request
                .post('/orders')
                .send(item)
                .expect(400)
        })
    })

    describe('#PUT', () => {
        it('200 - Should cancel an order', async () => {
            const stock = (await Inventories.find({})).map((s) => s.toJSON())

            const order = {
                email: 'test@test.com',
                items: [
                    { uuid: stock[0].uuid, quantity: 1 },
                    { uuid: stock[1].uuid, quantity: 2 }
                ]
            }

            const item = new Orders(order)

            await item.save()

            const update = { status: 'CANCELLED' }

            await request
                .put(`/orders/${item.uuid}`)
                .send(update)
                .expect(200)

            const updated = await Orders.findOne({ uuid: item.uuid })
            expect(updated.status).toBe('CANCELLED')
            expect(updated).toMatchObject(update)

            const stockAfterOrder = (await Inventories.find({})).map((s) => s.toJSON())

            expect(stockAfterOrder[0].quantity).toBe(stock[0].quantity + 1)
            expect(stockAfterOrder[1].quantity).toBe(stock[1].quantity + 2)
        })

        it.each([
            [
                {
                    email: 'test@test.com'
                }
            ],
            [
                {
                    items: []
                }
            ],
            [
                {}
            ],
            [
                {
                  anythingExtra: 42
                }
            ]
        ])('400 - Should reject bad payloads', async (update) => {
            const stock = (await Inventories.find({})).map((s) => s.toJSON())

            const order = new Orders({
                email: 'test@test.com',
                items: [
                    { uuid: stock[0].uuid, quantity: stock[0].quantity + 1 },
                    { uuid: stock[1].uuid, quantity: 2 }
                ]
            })

            await order.save()
            const record = order.toJSON()

            await request
                .put(`/orders/${record.uuid}`)
                .send(update)
                .expect(400)
        })
    })

    describe('#DELETE', () => {
        it('200 - Should delete an order', async () => {
            const stock = (await Inventories.find({})).map((s) => s.toJSON())

            const order = new Orders({
                email: 'test@test.com',
                items: [
                    { uuid: stock[0].uuid, quantity: 1 },
                    { uuid: stock[1].uuid, quantity: 2 }
                ]
            })

            await order.save()

            await request
                .delete(`/orders/${order.uuid}`)
                .expect(200)

            await request
                .get(`/orders/${order.uuid}`)
                .expect(404)

            const deletedOrder = await Orders.findOne({ uuid: order.uuid })
            expect(deletedOrder).toHaveProperty('deletedAt')

            const { body } = await request
                .get(`/orders`)
                .expect(200)

            expect(body.find((o: OrdersRecord) => o.uuid === order.uuid)).toBe(undefined)

            const stockAfterOrder = (await Inventories.find({})).map((s) => s.toJSON())

            expect(stockAfterOrder[0].quantity).toBe(stock[0].quantity + 1)
            expect(stockAfterOrder[1].quantity).toBe(stock[1].quantity + 2)
        })

        it('200 - Should delete an order', async () => {
            const stock = (await Inventories.find({})).map((s) => s.toJSON())

            const order = new Orders({
                email: 'test@test.com',
                items: [
                    { uuid: stock[0].uuid, quantity: 1 },
                    { uuid: stock[1].uuid, quantity: 2 }
                ],
                status: 'CANCELLED'
            })

            await order.save()

            await request
                .delete(`/orders/${order.uuid}`)
                .expect(200)

            await request
                .get(`/orders/${order.uuid}`)
                .expect(404)

            const deletedOrder = await Orders.findOne({ uuid: order.uuid })
            expect(deletedOrder).toHaveProperty('deletedAt')

            const { body } = await request
                .get(`/orders`)
                .expect(200)

            expect(body.find((o: OrdersRecord) => o.uuid === order.uuid)).toBe(undefined)

            const stockAfterOrder = (await Inventories.find({})).map((s) => s.toJSON())

            expect(stockAfterOrder[0].quantity).toBe(stock[0].quantity)
            expect(stockAfterOrder[1].quantity).toBe(stock[1].quantity)
        })
    })
})
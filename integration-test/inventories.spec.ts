import { SuperTest, Test } from 'supertest'
import {Inventories, InventoriesModel, InventoriesRecord, Orders, OrdersRecord} from "../src/models"
import { clearDatabase, destroyApp, getApp } from "./app";
import uuid = require("uuid");

let request: SuperTest<Test>

beforeAll(async () => {
    request = await getApp()
})

beforeEach(async () => {
    await clearDatabase()
})

afterAll(async () => {
    await destroyApp()
})

describe('/inventories', () => {
    describe('#GET', () => {
        it('200 - Should get an inventory item', async () => {
            const item = new Inventories({
                name: 'Tree',
                description: 'This is a nice tree',
                price: 5.99,
                quantity: 1000
            })

            await item.save()
            const record = item.toJSON()

            const { body } = await request
                .get(`/inventories/${record.uuid}`)
                .expect(200)

            expect(body).toMatchObject({ name: 'Tree',
                description: 'This is a nice tree',
                price: 5.99,
                quantity: 1000
            })

            expect(body).toHaveProperty('createdAt')
            expect(body).toHaveProperty('uuid')
        })

        it('200 - Should get inventory items', async () => {
            const items = [
                {
                    name: 'Tree',
                    description: 'This is a nice tree',
                    price: 5.99,
                    quantity: 1000
                },
                {
                    name: 'Flower',
                    description: 'This is a nice flower',
                    price: 5.99,
                    quantity: 1000
                }
            ]

            await Promise.all(items.map(item => new Inventories(item).save()))

            const { body } = await request
                .get(`/inventories`)
                .expect(200)

            expect(body).toHaveLength(items.length)
            items.forEach((item, i) => {
                expect(body[i]).toMatchObject(item)
            })
        })

        it('404 - Should respond not found if uuid is not found', async () => {
            const { body } = await request
                .get(`/inventories/${uuid()}`)
                .expect(404)
        })
    })

    describe('#POST', () => {
        it('201 - Should create an inventory item', async () => {
            const item = {
                name: 'Tree',
                description: 'This is a nice tree',
                price: 5.99,
                quantity: 1000
            }

            const {body} = await request
                .post('/inventories')
                .send(item)
                .expect(201)

            expect(body).toHaveProperty('uuid')

            const created = await Inventories.findOne(body)
            expect(created).toMatchObject(item)
        })

        it.each([
            [
                {
                    name: 'Tree',
                    price: 5.99,
                    quantity: 1000
                }
            ],
            [
                {
                    name: 'Tree',
                    description: 'This is a nice tree',
                }
            ],
            [
                {}
            ],
            [
                {
                    name: 'Tree',
                    description: 'This is a nice tree',
                    price: 5.99,
                    quantity: 1000,
                    extra: 1000
                }
            ]
        ])('400 - Should reject bad payloads', async (item) => {
            const {body} = await request
                .post('/inventories')
                .send(item)
                .expect(400)
        })
    })

    describe('#PUT', () => {
        it('200 - Should update an inventory item', async () => {
            const item = new Inventories({
                name: 'Tree',
                description: 'This is a nice tree',
                price: 5.99,
                quantity: 1000
            })

            await item.save()
            const record = item.toJSON()

            const update = {
                name: 'Green Tree',
                description: 'This is a nice green tree',
                price: 6.99,
                quantity: 1100
            }

            await request
                .put(`/inventories/${record.uuid}`)
                .send(update)
                .expect(200)

            const updated = await Inventories.findOne({ uuid: record.uuid })
            expect(updated).toMatchObject(update)
        })

        it.each([
            [
                {
                    name: 'Tree',
                    price: 5.99,
                    quantity: 1000
                }
            ],
            [
                {
                    name: 'Tree',
                    description: 'This is a nice tree',
                }
            ],
            [
                {}
            ],
            [
                {
                    name: 'Tree',
                    description: 'This is a nice tree',
                    price: 5.99,
                    quantity: 1000,
                    extra: 1000
                }
            ]
        ])('400 - Should reject bad payloads', async (update) => {
            const item = new Inventories({
                name: 'Tree',
                description: 'This is a nice tree',
                price: 5.99,
                quantity: 1000
            })

            await item.save()

            await request
                .put(`/inventories/${item.uuid}`)
                .send(update)
                .expect(400)
        })
    })

    describe('#DELETE', () => {
        it('200 - Should delete an item', async () => {
            const item = new Inventories({
                name: 'Tree',
                description: 'This is a nice tree',
                price: 5.99,
                quantity: 1000
            })

            await item.save()

            await request
                .delete(`/inventories/${item.uuid}`)
                .expect(200)

            const deletedItem = await Inventories.findOne({ uuid: item.uuid })

            await request
                .get(`/inventories/${item.uuid}`)
                .expect(404)


            expect(deletedItem).toHaveProperty('deletedAt')

            const { body } = await request
                .get(`/inventories`)
                .expect(200)

            expect(body.find((i: InventoriesRecord) => i.uuid === item.uuid)).toBe(undefined)

        })
    })
})
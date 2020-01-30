import supertest, {SuperTest, Test} from 'supertest'

import {server, TreezApp} from '../src/server'
import { Inventories } from "../src/models"
import { config } from "../src/config"

let request: SuperTest<Test>
let treezApp: TreezApp

beforeAll(async (done) => {
    treezApp = await server({ config })
    request = await supertest(treezApp.app)
    setTimeout(done, 1000)
})

afterAll(async () => {
    treezApp.destroy()
})

describe('/inventories' , () => {
    describe('#POST', () => {
        it('Should create an inventory item', async () => {
            const item = {
                name: 'Tree',
                description: 'This is a nice tree',
                price: 5.99,
                quantity: 1000
            }
            const { body } = await request
                .post('/inventories')
                .send(item)
                .expect(201)

            expect(body).toHaveProperty('uuid')

            const created = await Inventories.findOne(body)
            expect(created).toMatchObject(item)
        })
    })
})
import { init, TreezApp } from "../src/server"
import mongoose from 'mongoose'
import {config} from "../src/config"
import supertest, {SuperTest, Test} from "supertest"
import { Inventories, Orders } from "../src/models";

const serverPromise = init({ config })

let request: SuperTest<Test>
let treezApp: TreezApp

export const getApp: () => Promise<SuperTest<Test>> = async () => {
    if (!request) {
        treezApp = await serverPromise
        request = supertest(treezApp.app)
    }

    return request
}

export const clearDatabase = async (): Promise<void> => {
    await Inventories.remove({})
    await Orders.remove({})
};

export const destroyApp: () => void = () => {
    treezApp.destroy()
}
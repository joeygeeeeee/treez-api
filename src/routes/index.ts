import inventories from './inventories'
import { Router } from 'express'

const routesCollection: [string, Router][] = [
    ['/inventories', inventories]
]

export default routesCollection
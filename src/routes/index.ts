import inventories from './inventories'
import orders from './orders'
import { Router } from 'express'

const routesCollection: Array<[string, Router]> = [
  ['/inventories', inventories],
  ['/orders', orders]
]

export default routesCollection

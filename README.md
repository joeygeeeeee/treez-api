## Treez API
### System Dependencies
- Docker
- Node > 10
- yarn (Recommended)
### Configure
See docker-compose for configurable env vars (Currently only `TREEZ_PORT`)
See `src/config.ts` for default values.
### Run
```bash
    docker-compose up
```
### Test
`yarn test` or `npm run test`

### To do
- Stricter testing around object schemas
- Allow for more order status' and handle inventory logic accordingly
- Add transactional queries keeping orders and inventories in sync
- Add unit tests to modules that are more logic heavy (routes files that may contain complex transactional sequences and behaviours)
- Abstract out some of the common query behaviours (soft deletes, inventory incrementing etc)
### Notes
- Currently the PUT /orders/:uuid endpoint can only be used to cancel an order (by updating order status)
- The DELETE /orders/:uuid endpoint only soft deletes an order, not to be typically used to cancel an order
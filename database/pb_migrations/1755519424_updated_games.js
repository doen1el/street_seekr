/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // update collection data
  unmarshal({
    "createRule": "",
    "deleteRule": null,
    "updateRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": "",
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})

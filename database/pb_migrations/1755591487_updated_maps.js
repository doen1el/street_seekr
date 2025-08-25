/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1612934933")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "json3349422354",
    "maxSize": 5242880,
    "name": "polygon",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1612934933")

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "json3349422354",
    "maxSize": 0,
    "name": "polygon",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1612934933")

  // remove field
  collection.fields.removeById("number3616816488")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1612934933")

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number3616816488",
    "max": null,
    "min": null,
    "name": "area",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})

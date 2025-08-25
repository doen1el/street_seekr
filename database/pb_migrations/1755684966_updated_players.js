/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3072146508")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number1767698865",
    "max": null,
    "min": null,
    "name": "totalPoints",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number1895720511",
    "max": null,
    "min": null,
    "name": "lastRoundPoints",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3072146508")

  // remove field
  collection.fields.removeById("number1767698865")

  // remove field
  collection.fields.removeById("number1895720511")

  return app.save(collection)
})

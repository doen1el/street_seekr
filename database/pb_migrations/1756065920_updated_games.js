/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // add field
  collection.fields.addAt(19, new Field({
    "hidden": false,
    "id": "number3797885251",
    "max": null,
    "min": null,
    "name": "generation_found",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "hidden": false,
    "id": "number275659301",
    "max": null,
    "min": null,
    "name": "generation_target",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // remove field
  collection.fields.removeById("number3797885251")

  // remove field
  collection.fields.removeById("number275659301")

  return app.save(collection)
})

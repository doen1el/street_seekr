/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // remove field
  collection.fields.removeById("relation2776970063")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // add field
  collection.fields.addAt(22, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3072146508",
    "hidden": false,
    "id": "relation2776970063",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "round_participants",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})

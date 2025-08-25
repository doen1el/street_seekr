/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3072146508")

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_69621308",
    "hidden": false,
    "id": "relation3036739024",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "last_game",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3072146508")

  // remove field
  collection.fields.removeById("relation3036739024")

  return app.save(collection)
})

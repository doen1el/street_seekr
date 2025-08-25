/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "json3378920680",
    "maxSize": 0,
    "name": "locationStrings",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "json3349422354",
    "maxSize": 5242880,
    "name": "polygon",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "number2302513201",
    "max": null,
    "min": null,
    "name": "graceDistance",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "number3232262906",
    "max": null,
    "min": null,
    "name": "density",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "id": "json3607726417",
    "maxSize": 0,
    "name": "challenge",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // remove field
  collection.fields.removeById("json3378920680")

  // remove field
  collection.fields.removeById("json3349422354")

  // remove field
  collection.fields.removeById("number2302513201")

  // remove field
  collection.fields.removeById("number3232262906")

  // remove field
  collection.fields.removeById("json3607726417")

  return app.save(collection)
})

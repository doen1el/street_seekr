/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // remove field
  collection.fields.removeById("text3829241613")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number1322237522",
    "max": null,
    "min": null,
    "name": "timeLimit",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1612934933",
    "hidden": false,
    "id": "relation2477632187",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "map",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number1643158832",
    "max": null,
    "min": 0,
    "name": "currentRound",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number2904430045",
    "max": null,
    "min": 1,
    "name": "maxRounds",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_69621308")

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3829241613",
    "max": 0,
    "min": 0,
    "name": "map_code",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("number1322237522")

  // remove field
  collection.fields.removeById("relation2477632187")

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number1643158832",
    "max": null,
    "min": 0,
    "name": "current_round",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number2904430045",
    "max": null,
    "min": 1,
    "name": "max_rounds",
    "onlyInt": true,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
})

const fs = require('fs');

function addResponList(key, response, isImage, image_url) {
  var obj_add = {
    key: key,
    response: response,
    isImage: isImage,
    image_url: image_url
  }
  db.data.list.push(obj_add)
}

function getDataResponList(key) {
  let position = null
  Object.keys(db.data.list).forEach((x) => {
    if (db.data.list[x].key.toLowerCase() === key.toLowerCase()) {
      position = x
    }
  })
  if (position !== null) {
    return db.data.list[position]
  }
}

function isAlreadyResponList(key) {
  let found = false
  Object.keys(db.data.list).forEach((x) => {
    if (db.data.list[x].key.toLowerCase() === key.toLowerCase()) {
      found = true
    }
  })
  return found
}

function sendResponList(key) {
  let position = null
  Object.keys(db.data.list).forEach((x) => {
    if (db.data.list[x].key.toLowerCase() === key.toLowerCase()) {
      position = x
    }
  })
  if (position !== null) {
    return db.data.list[position].response
  }
}

function resetListAll() {
  db.data.list = []
}

function delResponList(key) {
  let position = null
  Object.keys(db.data.list).forEach((x) => {
    if (db.data.list[x].key.toLowerCase() === key.toLowerCase()) {
      position = x
    }
  })
  if (position !== null) {
    db.data.list.splice(position, 1)
  }
}

function updateResponList(key, response, isImage, image_url) {
  let position = null
  Object.keys(db.data.list).forEach((x) => {
    if (db.data.list[x].key.toLowerCase() === key.toLowerCase()) {
      position = x
    }
  })
  if (position !== null) {
    db.data.list[position].response = response
    db.data.list[position].isImage = isImage
    db.data.list[position].image_url = image_url
  }
}
module.exports = {
  addResponList,
  delResponList,
  resetListAll,
  isAlreadyResponList,
  sendResponList,
  updateResponList,
  getDataResponList
}

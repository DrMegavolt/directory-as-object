require('util.promisify/shim')()
const { promisify } = require('util')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const rmFile = promisify(fs.unlink)
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const path = require('path')
class DirectoryAsObject {
  constructor ({rootPath, ignorePatterns = []}) {
    this.rootPath = rootPath
    this.ignorePatterns = ignorePatterns
  }
  serialize () {
    readdir(this.rootPath).then(filenames => {
    // Ignore files/sub dirs matching regex patterns
      return filenames
        .filter(name => !this.ignorePatterns.some(pattern => pattern.test(name)))
        .map((filename) => {
          return readFile(path.join(this.rootPath, filename), 'utf-8')
            .then(content => { return { filename, content } })
        })
    })
  }
  deserialize (data) {

  }
}

module.exports = DirectoryAsObject

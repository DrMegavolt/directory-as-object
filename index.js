require('util.promisify/shim')()
const { promisify } = require('util')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const rmFile = promisify(fs.unlink)
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const fileStat = promisify(fs.lstat)
const path = require('path')
class DirectoryAsObject {
  constructor ({rootPath, ignorePatterns = []}) {
    this.rootPath = rootPath
    this.ignorePatterns = ignorePatterns
  }
  serialize () {
    return readdir(this.rootPath)
      .then(filenames => {
        // Ignore files/sub dirs matching regex patterns
        return filenames
          .filter(name => !this.ignorePatterns.some(pattern => pattern.test(name)))
          .map((filename) => {
            return this.readFileOrFolder(filename)
          })
      })
      .then(readFileOps => { return Promise.all(readFileOps) })
      .then(fileInfos => {
        console.log('FFF', fileInfos)

        return fileInfos.reduce((result, curr) => {
          result[curr.filename] = curr.content
          return result
        }, {})
      })
  }
  deserialize (data) {

  }
  readFileOrFolder (filename) {
    let p = path.join(this.rootPath, filename)
    return fileStat(p)
      .then(stat => {
        if (stat.isFile()) {
          return readFile(p, 'utf-8')
            .then(content => {
              return { filename: filename, content }
            })
        } else {
          let recursiveDirAsObject = new DirectoryAsObject({rootPath: p, ignorePatterns: this.ignorePatterns})
          return recursiveDirAsObject.serialize()
            .then(content => { return { filename: filename, content } })
        }
      })
  }
}

module.exports = DirectoryAsObject

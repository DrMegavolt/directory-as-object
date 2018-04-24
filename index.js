require('util.promisify/shim')()
const { promisify } = require('util')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const rmFile = promisify(fs.unlink)
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const fileStat = promisify(fs.lstat)

const rimraf = promisify(require('rimraf'))
const path = require('path')
class DirectoryAsObject {
  constructor ({rootPath, ignorePatterns = []}) {
    this.rootPath = rootPath
    this.ignorePatterns = ignorePatterns
  }
  serialize () {
    if (!fs.existsSync(this.rootPath)) {
      return {}
    }
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
        return fileInfos.reduce((result, curr) => {
          result[curr.filename] = curr.content
          return result
        }, {})
      })
  }
  deserialize (files) {
    if (!fs.existsSync(this.rootPath)) {
      fs.mkdirSync(this.rootPath)
    }
    const promises = Object.keys(files).map(filename => {
      const filePath = path.join(this.rootPath, filename)
      if (files[filename] === null) { // if key is present but null do delete the file or folder
        return fileStat(filePath)
          .then(stat => {
            if (stat.isFile()) {
              return rmFile(filePath)
            } else {
              return rimraf(filePath)
            }
          })
      }
      if (typeof files[filename] === 'string') {
        return writeFile(filePath, files[filename])
      } else { // this is directory representation
        let recursiveDirAsObject = new DirectoryAsObject({rootPath: filePath})
        return recursiveDirAsObject.deserialize(files[filename])
      }
    })
    return Promise.all(promises)
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

## Directory As Object 
This package can serialize and deserialize directory with files into\from JS object


- It scans directory recursively
- It can update existing files. Including deleting those that have correstponding property set to `null`

### Usage

#### Reading from directory
```js
const dirAsObject = new DirectoryAsObject({rootPath: '/some/path'});
dirAsObject.serialize().then(files=> console.log(files));
```

#### Writing to directory
```js
const dirAsObject = new DirectoryAsObject({rootPath: '/some/path'});
dirAsObject.deserialize({'test.js':'//hello'}).then(()=> console.log('Done'));;
```

#### Deleting files
The following code will delete `/some/path/test.js`
```js
const dirAsObject = new DirectoryAsObject({rootPath: '/some/path'});
dirAsObject.deserialize({'test.js': null}).then(()=> console.log('Done'));;
```

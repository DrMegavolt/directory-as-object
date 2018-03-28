## Directory As Object 
This package can serialize and deserialize directory with files into\from JS object

It scans directory recursively

#### Usage
```
const dirAsObject = new DirectoryAsObject({rootPath: '/some/path'});
dirAsObject.serialize().then(files=> console.log(files));
```

```
const dirAsObject = new DirectoryAsObject({rootPath: '/some/path'});
dirAsObject.deserialize({'test.js':'//hello'}).then(()=> console.log('Done'));;
```



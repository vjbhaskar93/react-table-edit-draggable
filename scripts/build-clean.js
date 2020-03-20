const { remove } = require('fs-extra');

remove('dist/', (err) => err && console.error(err));
remove('lib/', (err) => err && console.error(err));
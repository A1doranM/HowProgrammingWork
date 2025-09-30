"use strict";

// Доказательства того что все модули и так синглтоны по умолчанию.
const { collection } = require("./1-export.js");
collection.set("key1", "value1");

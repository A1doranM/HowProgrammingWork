'use strict';

const init = require('eslint-config-metarhia');

init[0].rules['no-invalid-this'] = 'off';

module.exports = init;

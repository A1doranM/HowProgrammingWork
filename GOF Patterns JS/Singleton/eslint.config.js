'use strict';

const init = require('eslint-config-metarhia');

init[0].rules['no-self-compare'] = 'off';
init[0].rules['no-invalid-this'] = 'off';
init[0].rules['no-extra-parens'] = 'off';
init[0].ignores.push('**/*.mjs');

module.exports = init;

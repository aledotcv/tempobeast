#!/usr/bin/env node

const { menu } = require('./cli/menu');
const { startServers } = require('./server');

startServers();
menu();



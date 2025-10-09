const readline = require('readline');
const { setOverride, disableOverride, isEnabled, getHost } = require('../config/overrideState');
const { buildIndex } = require('../utils/indexer');

function validateHost(host) {
  return /^https?:\/\/[^/]+$/.test(host);
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function ask(rl, q) {
  return new Promise(resolve => rl.question(q, resolve));
}

async function overrideFlow(rl) {
  console.log('\ninfo.json Track URL Host Override');
  console.log('This does NOT modify any files; it will only affect the URL sent for incoming requests.');
  console.log('Example host: http://192.168.1.10:3001');
  console.log(`Current status: ${isEnabled() ? 'ENABLED -> ' + getHost() : 'disabled'}`);
  const action = (await ask(rl, 'Choose: (e)nable / (d)isable / (c)ancel: ')).trim().toLowerCase();
  switch (action) {
    case 'e':
    case 'enable': {
      let host;
      while (true) {
        host = (await ask(rl, 'Enter new host (include http/https, no trailing slash/path): ')).trim();
        if (validateHost(host)) break;
        console.log('Invalid host. Must match pattern: http(s)://host[:port]');
      }
      setOverride(host);
      console.log(`Override enabled --> ${host}`);
      break; }
    case 'd':
    case 'disable':
      disableOverride();
      console.log('Override disabled.');
      break;
    default:
      console.log('No change.');
  }
}

async function menu() {
  const rl = createInterface();
  console.log('TB Node Control Menu');
  console.log('1) Configure trackUrl host override');
  console.log('2) Rebuild track index');
  console.log('3) Exit');
  const choice = (await ask(rl, 'Select an option: ')).trim();
  switch (choice) {
    case '1':
      await overrideFlow(rl);
      break;
    case '2':
      console.log('Rebuilding index...');
      try {
        await buildIndex();
        console.log('Index rebuilt successfully.');
      } catch (e) {
        console.error('Index rebuild failed:', e.message);
      }
      break;
    default:
      rl.close();
      process.exit(0);
  }
  const again = (await ask(rl, 'Return to menu? (Y/n): ')).trim().toLowerCase();
  if (again === 'n' || again === 'no') {
    rl.close();
    process.exit(0);
  } else {
    rl.close();
    menu();
  }
}

module.exports = { menu };

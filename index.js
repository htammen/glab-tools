#!/usr/bin/env node

import glab_cmr from './src/glab_cmr.js'
import glab_mmr from './src/glab_mmr.js'

const action = process.argv[2].toUpperCase()

switch (action) {
  case 'CMR':
    // create merge request
    glab_cmr();
    break;
  case 'MMR':
    // merge merge request
    glab_mmr();
    break;

  default:
    console.log(`sorry you called me with wrong parameters`)
    break;
}



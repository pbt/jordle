import * as readline from 'readline/promises';
import * as process from 'process';
import { readFile } from 'fs/promises';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const WORD_LEN = 5;

/**
 * Display a jordle state.
 * @param {string[]} state - a list of words representing a current game of jordle.
 * @param {string} solution - the solution
 */
function displayState(state, solution, showWords = true) {
  state.forEach((candidate) => {
    const list = matchesList(candidate, solution);
    const displayMatches = list.map(fmtMatch).join('');
    if (showWords) {
      console.log('%s %s', candidate, displayMatches);
    }
    else {
      console.log('%s', candidate);
    }
  })
}

function displayScore(state, solution) {
  console.log(`jordle ${lost(state, solution) ? 'X' : state.length}/6`)
}

function fmtMatch(match) {
  switch (match) {
    case -1: return '⬜️';
    case 0: return '🟨';
    case 1: return '🟩';
  }
}

function matchesList(candidate, solution) {
  const matchesList = [];
  for (let i = 0; i < WORD_LEN; i++) {
    matchesList.push(matches(candidate, solution, i));
  }
  return matchesList;
}

function matches(candidate, solution, index) {
  if (candidate.toLocaleLowerCase().charAt(index) === solution.toLocaleLowerCase().charAt(index)) {
    return 1;
  }
  if (solution.toLocaleLowerCase().includes(candidate.toLocaleLowerCase().charAt(index))) {
    return 0;
  }
  return -1;
}

function won(state, solution) {
  return state.length > 0 && matchesList(state[state.length - 1], solution).filter((i) => i === 1).length === WORD_LEN;
}

function lost(state, solution) {
  return !won(state, solution) && state.length >= 6;
}

async function jordle(state, solution, words) {
  displayScore(state, solution);
  displayState(state, solution);
  if (won(state, solution)) {
    console.log("You win!")
    return null;
  }
  if (lost(state, solution)) {
    console.log(`You lost :( The answer was: ${solution}`)
    return null;
  }

  while (true) {
    const answer = await rl.question(`Next guess (${6 - state.length} guesses remaining) \n> `);
    if (answer.length !== WORD_LEN) {
      console.log(`words must be exactly ${WORD_LEN} letters long`)
    } else if (answer === 'xyzzy') {
      // dev mode
      console.log(JSON.stringify({state, solution}));
    } else if (!words.find((value) => String(value).toLocaleLowerCase() === answer.toLocaleLowerCase())) {
      console.log(`Didn't recognize ${answer.toLocaleLowerCase()}`)
    } else {
      return [...state, answer.toLocaleLowerCase()];
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function main() {
  const initialState = [];
  let state = initialState;

  const words = (await readFile('./words', { encoding: 'utf8' })).split('\n');

  const solutions = words;
  const solution = String(solutions[getRandomInt(solutions.length)]).toLowerCase();

  while (true) {
    state = await jordle(state, solution, words);
    if (state === null) {
      process.exit(0);
    }
  }
}

void main();

export {}

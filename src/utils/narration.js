// ─────────────────────────────────────────────────────────────────────────────
// Narration Scripts — Numbers to 1000
// CRITICAL: Every string here MUST exactly match the on-screen text shown in
// UI components. 1:1 parity prevents confusing young learners (6-8 yrs).
// ─────────────────────────────────────────────────────────────────────────────

import { say, ask, cheer, emphasize, think, celebrate } from './audio';

// ── INTRO SCREEN ─────────────────────────────────────────────────────────────
export function introNarration() {
  return [
    cheer("Welcome to Numbers to 1000!"),
    say("Today we are going to learn how to count all the way to one thousand."),
    say("We will use hundreds, tens, and ones to read, write, and compare big numbers."),
    cheer("Are you ready to explore big numbers? Let's get started on our learning journey!"),
  ];
}

// ── WONDER PHASE ──────────────────────────────────────────────────────────────
export function wonderNarration() {
  return [
    think("Wow, look at all those stars!"),
    emphasize("Did you know there are one thousand of them?"),
    say("Today we are going to learn how to count all the way to one thousand."),
    cheer("Are you ready to explore big numbers? Let's go!"),
  ];
}

// ── STORY PHASE ───────────────────────────────────────────────────────────────
export function getStoryNarration(slideIndex) {
  switch (slideIndex) {
    case 0:
      return [
        say("Oliver and Asha visited Grandpa Ben's bead shop after school."),
        say("\"Grandpa Ben, how do you count all your beads?\" asks Oliver."),
        say("Grandpa Ben smiles: \"I use a very clever trick! Let me show you.\""),
      ];
    case 1:
      return [
        say("Grandpa Ben placed three big boxes on the counter."),
        emphasize("Each box had one hundred beads inside!"),
        say("\"Three boxes means... three hundreds!\" he said."),
      ];
    case 2:
      return [
        say("Next, he counted four bags of ten beads each."),
        emphasize("Four bags means four tens — that is forty!"),
      ];
    case 3:
      return [
        say("Asha counted the loose beads: \"One, two, three, four, five!\""),
        cheer("Three hundred and forty-five! We did it!"),
      ];
    case 4:
      return [
        think("Every digit sits in a special place. That place tells you its value."),
        emphasize("Three hundreds, four tens, and five ones make three hundred and forty-five!"),
      ];
    case 5:
      return [
        celebrate("Now you know how to count all the way to one thousand!"),
        cheer("Hundreds, tens, and ones — that is the secret!"),
      ];
    default:
      return [];
  }
}

// ── SIMULATE PHASE ────────────────────────────────────────────────────────────
export function simulateStation1Intro() {
  return [
    say("Drag the base-ten blocks into the workspace to build a number!"),
    say("Use the plus and minus buttons to add hundreds, tens, and ones."),
  ];
}

export function simulateStation2Intro() {
  return [
    say("Now let's fill in the place value chart."),
    say("Drag each digit to its correct column — hundreds, tens, or ones."),
  ];
}

export function simulateStation3Intro() {
  return [
    ask("Can you place the number on the number line?"),
    say("Click or tap on the number line to place the marker at the right spot!"),
  ];
}

export function simulateStation4Intro() {
  return [
    ask("Look at the counting pattern. What number comes next?"),
    say("Find the missing number in the sequence!"),
  ];
}

export function simulatePhaseComplete() {
  return [
    celebrate("Amazing! You completed all four simulation stations!"),
    cheer("Time to play!"),
  ];
}

// ── PLAY PHASE ────────────────────────────────────────────────────────────────
export function playWorldIntro(worldName) {
  return [
    celebrate(`Welcome to ${worldName}!`),
  ];
}

export function playReadQuestion(questionText) {
  return [
    say(questionText),
  ];
}

export function playCorrectNarration(streak = 0) {
  if (streak >= 5) {
    return [celebrate(`${streak} in a row! Incredible!`)];
  }
  return [celebrate('Correct! Well done!')];
}

export function playWrongNarration(attempt = 1) {
  if (attempt === 1) {
    return [say("Let's try again! Look at the place value chart.")];
  }
  return [say("Here's a clue! Count the hundreds first.")];
}

export function playWorldComplete(worldName, score, total) {
  return [
    celebrate(`${worldName} complete!`),
    say(`You scored ${score} out of ${total}.`),
  ];
}

export function playAllComplete() {
  return [
    celebrate("You've completed all ten worlds!"),
    cheer("You are a true numbers champion!"),
  ];
}

// ── REFLECT PHASE ─────────────────────────────────────────────────────────────
export function reflectIntroNarration() {
  return [
    ask("What did you learn today about numbers to one thousand?"),
  ];
}

export function reflectCorrectNarration() {
  return [celebrate("That's right!")];
}

export function reflectWrongNarration() {
  return [say("Good try! Let's remember that together.")];
}

export function reflectConfidenceNarration() {
  return [
    ask("How confident do you feel about numbers to one thousand?"),
  ];
}

export function reflectCertificateNarration(pct) {
  return [
    say(`You scored ${Math.round(pct)} percent! Great work.`),
    celebrate("You can count all the way to one thousand!"),
  ];
}

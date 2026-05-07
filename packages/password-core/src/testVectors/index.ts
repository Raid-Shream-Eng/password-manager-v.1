import { normalizeDomain } from "../normalizeDomain";

const cases = [
    { 
        input: "https://www.Google.com/login?x=1",
        expected: "google.com",
     },
  {
    input: "  WWW.GITHUB.COM/Raid-Shream-Eng  ",
    expected: "github.com",
  },
  {
    input: "github.com",
    expected: "github.com",
  },    ];

  for (const testCase of cases) {
    const actual = normalizeDomain(testCase.input);
    if (actual !== testCase.expected) {
        console.error(`Test failed for input: ${testCase.input}. Expected: ${testCase.expected}, but got: ${actual}`);
    } else {
        console.log(`Test passed for input: ${testCase.input}`);
    }
  }
import { analyzeComplaint } from '../services/aiService.js';

// TODO: Replace with formal automated tests once test setup is added.
async function run() {
  const result = await analyzeComplaint('Road repair needed');
  console.log(result);
}

run();

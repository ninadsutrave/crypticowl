import {
  buildCluePrompt,
  CLUE_GENERATOR_SYSTEM,
  CLUE_RESPONSE_SCHEMA,
} from '../../constants/prompts.js';

/**
 * Generates a British cryptic clue for a given word and mechanism.
 *
 * @param {{ answer: string, type: string, definition: string }} lexical
 * @param {Function} callAI          - AI client (prompt, system, schema?) => object
 * @param {string|null} feedback     - Feedback from the judge on a previous failed attempt.
 *                                     When provided, the model is instructed to address the issues.
 */
export async function generateClue(lexical, callAI, feedback = null) {
  const prompt = buildCluePrompt(
    lexical.answer,
    lexical.type,
    lexical.definition,
    lexical.answer.length,
    feedback
  );

  return await callAI(prompt, CLUE_GENERATOR_SYSTEM, CLUE_RESPONSE_SCHEMA);
}

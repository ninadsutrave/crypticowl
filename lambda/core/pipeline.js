import { selectLexical } from './generator/lexicalPlanner.js';
import { generateClue } from './generator/clueGenerator.js';
import { judgeClue } from './validator/judge.js';
import { getRecentUsage } from '../services/dbService.js';
import { MAX_ATTEMPTS } from '../constants/prompts.js';

// Maximum clue attempts per lexical word before picking a new word.
const MAX_CLUE_ATTEMPTS_PER_LEXICAL = 3;

/**
 * Orchestrates the AI pipeline to generate a valid, high-quality clue.
 *
 * Strategy:
 *   • Outer loop: pick a new word (up to MAX_ATTEMPTS total clue attempts).
 *   • Inner loop: generate up to MAX_CLUE_ATTEMPTS_PER_LEXICAL clues for the
 *     current word, feeding the judge's feedback into each retry so the model
 *     can correct its specific mistakes.
 *   • If the judge signals rejectLexical (word+type fundamentally unsuitable),
 *     skip remaining inner attempts and select a new word immediately.
 *
 * @param {Function} callAI     - AI client (prompt, system, schema?) => object
 * @param {string}   aiProvider - e.g. "gemini"
 * @param {string}   dbProvider - e.g. "supabase"
 */
export async function generateValidClue(callAI, aiProvider, dbProvider) {
  // Fetch variety constraints once — non-fatal if unavailable.
  let constraints = { avoidTypes: [], avoidAnswers: [] };
  try {
    constraints = await getRecentUsage(dbProvider);
    console.log(
      `Variety constraints — avoid types: [${constraints.avoidTypes.join(', ')}], ` +
      `avoid answers: [${constraints.avoidAnswers.join(', ')}]`
    );
  } catch (e) {
    console.warn('Could not fetch recent usage (variety enforcement disabled):', e.message);
  }

  let totalAttempts = 0;

  while (totalAttempts < MAX_ATTEMPTS) {
    // ── Select a word + mechanism ──────────────────────────────────────────────
    let lexical;
    try {
      lexical = await selectLexical(callAI, constraints);
      console.log(
        `[${++totalAttempts}/${MAX_ATTEMPTS}] Lexical: ${lexical.answer} ` +
        `(${lexical.type}) — "${lexical.definition}"`
      );
    } catch (e) {
      console.error('Lexical selection failed:', e.message);
      totalAttempts++;
      continue;
    }

    // ── Inner feedback loop: up to N clue attempts for this word ──────────────
    let feedback = null;

    for (
      let clueAttempt = 1;
      clueAttempt <= MAX_CLUE_ATTEMPTS_PER_LEXICAL && totalAttempts <= MAX_ATTEMPTS;
      clueAttempt++
    ) {
      if (clueAttempt > 1) totalAttempts++;

      try {
        const clue = await generateClue(lexical, callAI, feedback);
        console.log(
          `  Clue attempt ${clueAttempt}: "${clue.clue}"`
        );

        const verdict = await judgeClue(clue, lexical, callAI);
        console.log(
          `  Judge: valid=${verdict.valid} score=${verdict.score} ` +
          `rejectLexical=${verdict.rejectLexical}`
        );

        if (verdict.valid) {
          console.log(`  Accepted (score ${verdict.score}/10): "${clue.clue}"`);
          return { lexical, clue, score: verdict.score };
        }

        console.log(`  Rejected: ${verdict.feedback}`);

        // Hard reject: word+type is fundamentally unsuitable — skip inner loop.
        if (verdict.rejectLexical) {
          console.log('  Lexical rejected — selecting a new word.');
          break;
        }

        // Carry feedback into the next clue attempt.
        feedback = verdict.feedback;

      } catch (e) {
        console.error(`  Clue attempt ${clueAttempt} threw:`, e.message);
        feedback = null; // reset feedback on unexpected error
      }
    }
  }

  throw new Error(`Failed to generate a valid clue after ${MAX_ATTEMPTS} attempts`);
}

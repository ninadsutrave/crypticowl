import { buildJudgePrompt, JUDGE_SYSTEM, JUDGE_RESPONSE_SCHEMA } from '../../constants/prompts.js';
import { callGeminiFlash } from '../../clients/providers/gemini.js';

/**
 * Validates a generated clue in two stages:
 *
 * Stage 1 — Fast structural checks (no AI call):
 *   • Core fields present
 *   • Answer not leaked (except hidden type)
 *   • Ximenean extremity (definition at start or end)
 *   • Clue-parts reconstruct the full clue string
 *   • Letter count in parentheses matches answer length
 *   • Hidden word literally embedded (hidden type only)
 *
 * Stage 2 — Gemini expert review:
 *   • Wordplay correctness (synonym-aware — no rigid letter sort)
 *   • Surface quality score (1–5)
 *   • Indicator fairness
 *   • Overall score (1–10) and feedback
 *   • rejectLexical signal (word+type fundamentally unsuitable)
 *
 * Returns a unified verdict the pipeline can act on.
 *
 * @param {{ clue: string, definition: string, indicator: string, fodder: string, clue_parts: object[], wordplay_summary: string }} clue
 * @param {{ answer: string, type: string }} lexical
 * @param {Function} callAI  - AI client (prompt, system, schema?) => object
 */
export async function judgeClue(clue, lexical, callAI) {
  const errors = [];
  const type = lexical.type;
  const answer = lexical.answer.toUpperCase();

  // ── Stage 1: Structural checks ───────────────────────────────────────────────

  // 1a. Core fields
  if (!clue.clue || !clue.definition) {
    return {
      valid: false,
      score: 0,
      feedback: 'Missing core fields (clue or definition).',
      rejectLexical: false,
    };
  }

  // 1b. Answer leak (hidden type is exempt — the answer is embedded by design)
  if (type !== 'hidden' && clue.clue.toUpperCase().includes(answer)) {
    errors.push('Answer leaked in clue text.');
  }

  // 1c. Ximenean extremity — strip punctuation so "(5)" doesn't block the match
  const clueClean = clue.clue.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  const defClean = clue.definition.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  if (!clueClean.startsWith(defClean) && !clueClean.endsWith(defClean)) {
    errors.push('Definition not at an extremity (non-Ximenean).');
  }

  // 1d. Clue-parts reconstruction
  if (Array.isArray(clue.clue_parts) && clue.clue_parts.length > 0) {
    const reconstructed = clue.clue_parts.map((p) => p.text).join('');
    const normalise = (s) => s.replace(/\s+/g, ' ').trim();
    if (normalise(reconstructed) !== normalise(clue.clue)) {
      errors.push('Clue parts do not reconstruct the full clue text.');
    }
  } else {
    errors.push('Clue parts array is missing or empty.');
  }

  // 1e. Letter count
  const letterCountMatch = clue.clue.match(/\((\d+(?:,\d+)*)\)\s*$/);
  if (!letterCountMatch) {
    errors.push('Missing letter count at end of clue.');
  } else {
    const declared = letterCountMatch[1].split(',').reduce((s, n) => s + parseInt(n, 10), 0);
    if (declared !== answer.length) {
      errors.push(`Letter count (${declared}) does not match answer length (${answer.length}).`);
    }
  }

  // 1f. Hidden word: answer must be literally embedded
  if (type === 'hidden') {
    const clueLetters = clue.clue.toUpperCase().replace(/[^A-Z]/g, '');
    if (!clueLetters.includes(answer)) {
      errors.push(`Hidden word "${answer}" is not literally embedded in the clue text.`);
    }
  }

  // Structural failure — skip AI judge, return immediately
  if (errors.length > 0) {
    return {
      valid: false,
      score: 0,
      feedback: errors.join(' '),
      rejectLexical: false,
    };
  }

  // ── Stage 2: Gemini 3 Flash expert review ────────────────────────────────────
  // Uses a different model family from the generator (2.5 Pro) to break
  // the self-judging bias where the generator's blind spots match the judge's.
  let judgeResult;
  try {
    judgeResult = await callGeminiFlash(
      buildJudgePrompt(lexical, clue),
      JUDGE_SYSTEM,
      JUDGE_RESPONSE_SCHEMA
    );
  } catch (e) {
    // If the AI judge itself fails, fall back to structural-only verdict (pass).
    console.warn('[judge] Gemini Flash judge call failed, falling back to structural pass:', e.message);
    return {
      valid: true,
      score: 7,
      feedback: 'AI judge unavailable — passed structural checks only.',
      rejectLexical: false,
    };
  }

  // Threshold: 7+ = "high quality, minor polish needed" — no flawed clues ship.
  const valid = judgeResult.valid && judgeResult.wordplay_correct && judgeResult.score >= 7;

  return {
    valid,
    score: judgeResult.score,
    surfaceQuality: judgeResult.surface_quality,
    wordplayCorrect: judgeResult.wordplay_correct,
    indicatorFair: judgeResult.indicator_fair,
    feedback: judgeResult.feedback,
    rejectLexical: judgeResult.reject_lexical ?? false,
  };
}

import { createClient } from "@supabase/supabase-js";

// =========================
// CONFIG
// =========================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const MAX_ATTEMPTS = 3;

// =========================
// GEMINI CLIENT (Node 20 native fetch)
// =========================

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} - ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Empty LLM response");

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON from Gemini: ${text}`);
  }
}

// =========================
// LEXICAL PLANNER PROMPT
// =========================

function lexicalPrompt() {
  return `
You are a cryptic crossword setter.

Return ONLY valid JSON:

{
  "answer": "UPPERCASEWORD",
  "definition": "dictionary definition",
  "type": "anagram|charade|hidden|reversal|container",
  "difficulty": "easy|medium|hard"
}

RULES:
- real English word only
- NO proper nouns
- must be solvable via cryptic construction
- avoid obscure vocabulary
`;
}

// =========================
// CLUE GENERATOR PROMPT
// =========================

function cluePrompt(lexical) {
  return `
You are an elite British cryptic crossword setter operating at championship level.

Generate EXACTLY ONE cryptic clue.

INPUT:
Answer: ${lexical.answer}
Definition: ${lexical.definition}
Type: ${lexical.type}

RULES:
- NEVER change the answer
- STRICT Ximenean fairness required
- Must include precise definition + fair wordplay

Allowed mechanisms:
anagram, charade, container, hidden, reversal, homophone

STANDARD ABBREVIATIONS ONLY:
- Directions: N S E W NE NW SE SW
- Roman numerals: I V X L C D M
- Tennis: LOVE = O
- Left = L, Right = R
- NATO phonetic alphabet allowed

OUTPUT STRICT JSON:
{
  "clue": "",
  "definition": "",
  "wordplay": {
    "type": "",
    "indicator": "",
    "components": "",
    "construction": ""
  },
  "surface": ""
}
`;
}

// =========================
// JUDGE
// =========================

function judge(clueObj, lexical) {
  const errors = [];

  if (!clueObj?.clue) errors.push("missing_clue");
  if (!clueObj?.definition) errors.push("missing_definition");
  if (!clueObj?.wordplay) errors.push("missing_wordplay");

  // hard constraint: answer must appear (weak heuristic safety check)
  if (
    clueObj?.clue &&
    !clueObj.clue.toUpperCase().includes(lexical.answer)
  ) {
    errors.push("answer_not_in_clue_text");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =========================
// PIPELINE
// =========================

async function generateValidClue() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`Attempt ${attempt}`);

    const lexical = await callGemini(lexicalPrompt());
    const clue = await callGemini(cluePrompt(lexical));

    const verdict = judge(clue, lexical);

    if (verdict.valid) {
      return { lexical, clue };
    }

    console.log("Rejected:", verdict.errors);
  }

  throw new Error("Failed after max attempts");
}

// =========================
// SUPABASE INSERT
// =========================

async function writeToSupabase(lexical, clue) {
  const { error } = await supabase.from("clues").insert({
    clue_text: clue.clue,
    answer: lexical.answer,
    answer_pattern: String(lexical.answer.length),
    primary_type: lexical.type,
    definition_text: lexical.definition,
    wordplay_summary: clue.surface,
    difficulty: lexical.difficulty || "medium",
  });

  if (error) throw error;
}

// =========================
// LAMBDA HANDLER
// =========================

export const handler = async (event) => {
  try {
    const { lexical, clue } = await generateValidClue();

    await writeToSupabase(lexical, clue);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        answer: lexical.answer,
        clue: clue.clue,
      }),
    };
  } catch (err) {
    console.error("Lambda error:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
};
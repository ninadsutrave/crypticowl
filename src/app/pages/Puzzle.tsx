import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mascot, MascotMood } from '../components/Mascot';
import { Lightbulb, Send, RotateCcw, Copy, Check, ChevronDown, Share2 } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';

// ─── PUZZLE DATA ──────────────────────────────────────────────────────────────

const PUZZLE = {
  number: 42,
  date: 'April 1, 2026',
  clue: 'Pears mixed up to form a weapon (5)',
  answer: 'SPEAR',
  letterCount: 5,
  hints: [
    {
      id: 1,
      title: 'Definition Location',
      text: 'The definition is at the end of the clue.',
      highlight: 'a weapon',
      mascotComment: 'The definition is always at the start or end of a cryptic clue. Look at the end! 👀',
      color: '#3B82F6',
      bg: '#EFF6FF',
      border: '#93C5FD',
    },
    {
      id: 2,
      title: 'Spot the Indicator',
      text: '"Mixed up" is an anagram indicator! That means some letters need to be rearranged.',
      highlight: 'mixed up',
      mascotComment: '"Mixed up" signals an anagram — letters are getting scrambled! 🔀',
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#C4B5FD',
    },
    {
      id: 3,
      title: 'Find the Fodder',
      text: '"PEARS" is the fodder — these are the letters you need to rearrange!',
      highlight: 'Pears',
      mascotComment: 'P-E-A-R-S... these are your building blocks! Try shuffling them around! ✨',
      color: '#F97316',
      bg: '#FFF7ED',
      border: '#FED7AA',
    },
    {
      id: 4,
      title: 'Full Breakdown',
      text: 'Rearrange the letters of PEARS to get a 5-letter weapon. Think of a long pointed weapon used by knights...',
      highlight: null,
      mascotComment: "You've got all the pieces! P-E-A-R-S → _ _ _ _ _ 🎯",
      color: '#059669',
      bg: '#ECFDF5',
      border: '#6EE7B7',
    },
  ],
};

const CLUE_PARTS = [
  { text: 'Pears', type: 'fodder' },
  { text: ' mixed up ', type: 'indicator' },
  { text: 'to form ', type: null },
  { text: 'a weapon', type: 'definition' },
  { text: ' (5)', type: null },
];

const PART_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  definition: { bg: '#EFF6FF', color: '#1D4ED8', border: '#3B82F6', label: 'Definition' },
  indicator: { bg: '#F5F3FF', color: '#5B21B6', border: '#7C3AED', label: 'Indicator' },
  fodder: { bg: '#FFF7ED', color: '#C2410C', border: '#F97316', label: 'Fodder' },
  wordplay: { bg: '#ECFDF5', color: '#065F46', border: '#10B981', label: 'Wordplay' },
};

// ─── SCRAMBLE LETTERS ─────────────────────────────────────────────────────────

function ScrambleLetters() {
  const [shuffled, setShuffled] = useState(true);
  const letters = ['P', 'E', 'A', 'R', 'S'];
  const answer = ['S', 'P', 'E', 'A', 'R'];
  const colors = ['#7C3AED', '#F97316', '#0284C7', '#059669', '#DB2777'];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {(shuffled ? letters : answer).map((l, i) => (
          <motion.div
            key={`${shuffled}-${i}`}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 400 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm"
            style={{
              background: colors[i] + '22',
              border: `2px solid ${colors[i]}`,
              color: colors[i],
              fontFamily: "'Fredoka One', cursive",
              fontSize: '1.2rem',
            }}
          >
            {l}
          </motion.div>
        ))}
      </div>
      <button
        onClick={() => setShuffled(!shuffled)}
        className="text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-80"
        style={{ background: '#F5F0FF', color: '#7C3AED', border: '1.5px solid #C4B5FD', fontFamily: "'Nunito', sans-serif" }}
      >
        {shuffled ? '🔀 Rearrange!' : '↩️ Shuffle back'}
      </button>
    </div>
  );
}

// ─── HINT CARD ────────────────────────────────────────────────────────────────

function HintCard({ hint, index, isNew }: { hint: typeof PUZZLE.hints[0]; index: number; isNew: boolean }) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 20, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="rounded-3xl border-2 overflow-hidden shadow-sm"
      style={{ borderColor: hint.border, background: hint.bg }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: hint.color, color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: '0.85rem' }}
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: hint.color, marginBottom: 4 }}>
              Hint {index + 1}: {hint.title}
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
              {hint.text}
            </p>
            {hint.id === 3 && (
              <div className="mt-3">
                <ScrambleLetters />
              </div>
            )}
          </div>
        </div>

        {/* Mascot comment */}
        <div className="mt-3 flex items-center gap-2.5 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
          <Mascot mood={index < 2 ? 'hint' : index === 3 ? 'thinking' : 'thinking'} size={40} animate={false} />
          <p style={{ fontSize: '0.82rem', color: '#4C1D95', fontFamily: "'Nunito', sans-serif", fontWeight: 700, lineHeight: 1.5 }}>
            {hint.mascotComment}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SUCCESS STATE ────────────────────────────────────────────────────────────

function SuccessState({ hintsUsed, onReset }: { hintsUsed: number; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const runConfetti = useRef(false);

  useEffect(() => {
    if (!runConfetti.current) {
      runConfetti.current = true;
      const end = Date.now() + 2500;
      const colors = ['#7C3AED', '#F97316', '#34D399', '#38BDF8', '#FCD34D', '#F472B6'];
      const frame = () => {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, []);

  const getShareBlocks = () => {
    const blocks = [];
    for (let i = 0; i < 4; i++) {
      if (i < hintsUsed) blocks.push('🟨');
      else blocks.push('🟩');
    }
    return blocks.join('');
  };

  const shareText = `CrypticOwl #${PUZZLE.number}\n${getShareBlocks()}\nSolved with ${hintsUsed} hint${hintsUsed !== 1 ? 's' : ''}!\ncrypticowl.app`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className="space-y-5"
    >
      {/* Success header */}
      <div className="text-center py-6">
        <div className="flex justify-center mb-4">
          <Mascot mood="celebrating" size={120} speechBubble="Brilliant solve! 🎉" bubbleDirection="right" animate />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        >
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2.2rem', color: '#7C3AED', marginBottom: 4 }}>
            You got it! 🎊
          </h2>
          <p style={{ color: '#6B7280', fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>
            {hintsUsed === 0 ? "No hints needed — you're a natural!" :
              hintsUsed === 1 ? "Solved with just 1 hint. Impressive!" :
              `Solved with ${hintsUsed} hints. Great effort!`}
          </p>
        </motion.div>
      </div>

      {/* Answer reveal */}
      <div className="bg-white rounded-3xl p-6 border border-[#EDE9FE] shadow-md">
        <p style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', fontFamily: "'Nunito', sans-serif" }}>
          The Answer
        </p>
        <div className="flex gap-2 justify-center mb-4">
          {PUZZLE.answer.split('').map((l, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 400 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
                color: 'white',
                fontFamily: "'Fredoka One', cursive",
                fontSize: '1.4rem',
              }}
            >
              {l}
            </motion.div>
          ))}
        </div>

        {/* Full breakdown */}
        <div className="mt-5">
          <p style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', fontFamily: "'Nunito', sans-serif" }}>
            Full Breakdown
          </p>
          <div className="rounded-2xl p-4 mb-4" style={{ background: '#F9F7FF', border: '2px dashed #C4B5FD' }}>
            <p className="text-center" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#1E1B4B', lineHeight: 1.9 }}>
              {CLUE_PARTS.map((part, i) => (
                part.type ? (
                  <span
                    key={i}
                    style={{
                      background: PART_STYLES[part.type].bg,
                      color: PART_STYLES[part.type].color,
                      border: `2px solid ${PART_STYLES[part.type].border}`,
                      borderRadius: 8,
                      padding: '2px 7px',
                      marginInline: 2,
                      display: 'inline-block',
                    }}
                  >
                    {part.text}
                  </span>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              ))}
            </p>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Fodder', value: 'PEARS → the letters to rearrange', style: PART_STYLES.fodder },
              { label: 'Indicator', value: '"mixed up" → signals an anagram', style: PART_STYLES.indicator },
              { label: 'Definition', value: '"a weapon" → confirms SPEAR', style: PART_STYLES.definition },
              { label: 'Wordplay', value: 'PEARS → anagram → SPEAR ✓', style: PART_STYLES.wordplay },
            ].map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: row.style.bg, border: `1.5px solid ${row.style.border}` }}
              >
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold flex-shrink-0"
                  style={{ background: row.style.border, color: 'white', fontFamily: "'Nunito', sans-serif" }}
                >
                  {row.label}
                </span>
                <span style={{ fontSize: '0.85rem', color: row.style.color, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Share card */}
      <div className="bg-white rounded-3xl p-5 border border-[#EDE9FE] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Share2 size={16} className="text-[#7C3AED]" />
          <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: '#1E1B4B' }}>Share Your Result</p>
        </div>
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#F9F7FF', border: '2px dashed #C4B5FD' }}>
          <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: '#5B21B6', marginBottom: 4 }}>CrypticOwl #{PUZZLE.number}</p>
          <p className="text-2xl mb-2">{getShareBlocks()}</p>
          <p style={{ fontSize: '0.85rem', color: '#6B7280', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
            Solved with {hintsUsed} hint{hintsUsed !== 1 ? 's' : ''}!
          </p>
          <p style={{ fontSize: '0.78rem', color: '#9CA3AF', fontFamily: "'Nunito', sans-serif" }}>crypticowl.app</p>
        </div>

        <div className="flex gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🟩</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontFamily: "'Nunito', sans-serif" }}>= Solved without hint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🟨</span>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontFamily: "'Nunito', sans-serif" }}>= Used a hint</span>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{
            background: copied ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
            color: 'white',
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 800,
          }}
        >
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Result</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { emoji: '🔥', value: '4', label: 'Day Streak' },
          { emoji: '🧩', value: '43', label: 'Total Solved' },
          { emoji: '💡', value: hintsUsed.toString(), label: 'Hints Today' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-3 text-center border border-[#EDE9FE] shadow-sm">
            <div className="text-xl mb-1">{stat.emoji}</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.4rem', color: '#5B21B6' }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 border-2 border-[#EDE9FE] hover:bg-[#F9F7FF] transition-colors"
        style={{ color: '#7C3AED', fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}
      >
        <RotateCcw size={16} /> Try Again
      </button>
    </motion.div>
  );
}

// ─── WRONG ANSWER FEEDBACK ────────────────────────────────────────────────────

function WrongFeedback({ attempt, onDismiss }: { attempt: string; onDismiss: () => void }) {
  const messages = [
    "Hmm… not quite! Try again? 🤔",
    "Ooh, close but no cigar! Give it another go! 🎯",
    "Not this time — but you're thinking the right way!",
    "Nope! But don't give up — the answer is SPEAR-ingly close! 😄",
  ];
  const msg = messages[Math.min(Math.floor(Math.random() * messages.length), messages.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: '#FFF1F2', border: '2px solid #FCA5A5' }}
    >
      <Mascot mood="wrong" size={48} animate={false} />
      <div className="flex-1">
        <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.95rem', color: '#BE123C', marginBottom: 2 }}>
          Not quite!
        </p>
        <p style={{ fontSize: '0.83rem', color: '#9F1239', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
          "{attempt.toUpperCase()}" {msg}
        </p>
      </div>
      <button onClick={onDismiss} className="text-[#FDA4AF] hover:text-[#FB7185] transition-colors mt-0.5">✕</button>
    </motion.div>
  );
}

// ─── MAIN PUZZLE PAGE ─────────────────────────────────────────────────────────

export function Puzzle() {
  const [answer, setAnswer] = useState('');
  const [hintsUnlocked, setHintsUnlocked] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState<string | null>(null);
  const [newHintIndex, setNewHintIndex] = useState<number | null>(null);
  const [showAllHints, setShowAllHints] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getMood = (): MascotMood => {
    if (isCorrect) return 'celebrating';
    if (wrongAttempt) return 'wrong';
    if (hintsUnlocked > 0) return 'hint';
    return 'default';
  };

  const getMascotComment = () => {
    if (isCorrect) return 'Brilliant solve! 🎉';
    if (wrongAttempt) return "Hmm… not quite! 🤔";
    if (hintsUnlocked === 0) return "Let's crack this clue together! 🔍";
    if (hintsUnlocked === 1) return "Spotted the definition yet? 👀";
    if (hintsUnlocked === 2) return "Can you see the anagram now? 🔀";
    if (hintsUnlocked === 3) return "Shuffle those letters! ✨";
    return "You've got all the clues you need! 🎯";
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;
    if (answer.trim().toUpperCase() === PUZZLE.answer) {
      setIsCorrect(true);
      setWrongAttempt(null);
    } else {
      setWrongAttempt(answer.trim());
      setAnswer('');
      inputRef.current?.focus();
    }
  };

  const handleHint = () => {
    if (hintsUnlocked < PUZZLE.hints.length) {
      setNewHintIndex(hintsUnlocked);
      setHintsUnlocked(prev => prev + 1);
      setWrongAttempt(null);
    }
  };

  const handleReset = () => {
    setAnswer('');
    setHintsUnlocked(0);
    setIsCorrect(false);
    setWrongAttempt(null);
    setNewHintIndex(null);
  };

  const visibleHints = PUZZLE.hints.slice(0, hintsUnlocked);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-32 pt-6">
      {!isCorrect ? (
        <div className="space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-[#EDE9FE]">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.85rem', color: '#7C3AED', marginBottom: 2 }}>
                  🧩 CRYPTIC #{PUZZLE.number}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>
                  {PUZZLE.date}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-full px-3 py-1.5">
                <span className="text-sm">🔥</span>
                <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.9rem', color: '#EA580C' }}>3</span>
              </div>
            </div>

            {/* Mascot + Clue */}
            <div className="flex flex-col items-center gap-4">
              <Mascot mood={getMood()} size={90} speechBubble={getMascotComment()} bubbleDirection="right" animate />

              <div className="w-full rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, #F9F7FF, #F0F9FF)', border: '2px solid #E0E7FF' }}>
                <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 'clamp(1rem, 3vw, 1.2rem)', color: '#1E1B4B', lineHeight: 1.7 }}>
                  "{PUZZLE.clue}"
                </p>
              </div>

              {/* Answer boxes */}
              <div className="flex gap-2">
                {[...Array(PUZZLE.letterCount)].map((_, i) => {
                  const char = answer[i];
                  return (
                    <motion.div
                      key={i}
                      animate={char ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.15 }}
                      className="w-11 h-11 rounded-xl border-2 flex items-center justify-center"
                      style={{
                        borderColor: char ? '#7C3AED' : '#E0E7FF',
                        background: char ? '#F5F0FF' : '#FAFAFA',
                      }}
                    >
                      <span style={{ fontFamily: "'Fredoka One', cursive", color: '#5B21B6', fontSize: '1.2rem' }}>
                        {char?.toUpperCase() || ''}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Wrong attempt feedback */}
          <AnimatePresence>
            {wrongAttempt && (
              <WrongFeedback attempt={wrongAttempt} onDismiss={() => setWrongAttempt(null)} />
            )}
          </AnimatePresence>

          {/* Input + Buttons */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#EDE9FE]">
            <div className="flex gap-2 mb-3">
              <input
                ref={inputRef}
                type="text"
                maxLength={PUZZLE.letterCount}
                value={answer}
                onChange={e => setAnswer(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter your answer…"
                className="flex-1 py-3 px-4 rounded-2xl border-2 focus:outline-none transition-colors"
                style={{
                  borderColor: '#E0E7FF',
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: '1rem',
                  color: '#1E1B4B',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: '#F9F7FF',
                  textTransform: 'uppercase',
                }}
                onFocus={e => (e.target.style.borderColor = '#7C3AED')}
                onBlur={e => (e.target.style.borderColor = '#E0E7FF')}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={answer.length !== PUZZLE.letterCount}
                className="px-5 py-3 rounded-2xl flex items-center gap-2 transition-all disabled:opacity-40"
                style={{
                  background: answer.length === PUZZLE.letterCount ? 'linear-gradient(135deg, #7C3AED, #5B21B6)' : '#E5E7EB',
                  color: answer.length === PUZZLE.letterCount ? 'white' : '#9CA3AF',
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                }}
              >
                <Send size={16} />
                Submit
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleHint}
              disabled={hintsUnlocked >= PUZZLE.hints.length}
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all disabled:opacity-40"
              style={{
                borderColor: '#FED7AA',
                background: '#FFF7ED',
                color: '#C2410C',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
              }}
            >
              <Lightbulb size={16} />
              {hintsUnlocked >= PUZZLE.hints.length
                ? 'No more hints!'
                : `Get Hint ${hintsUnlocked + 1} of ${PUZZLE.hints.length}`}
              {hintsUnlocked > 0 && hintsUnlocked < PUZZLE.hints.length && (
                <span className="ml-1 flex gap-1">
                  {[...Array(PUZZLE.hints.length)].map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < hintsUnlocked ? '#F97316' : '#FED7AA' }} />
                  ))}
                </span>
              )}
            </motion.button>
          </div>

          {/* Hints */}
          <AnimatePresence>
            {visibleHints.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: '#1E1B4B' }}>
                    💡 Hints Unlocked ({hintsUnlocked}/{PUZZLE.hints.length})
                  </h3>
                  {visibleHints.length > 1 && (
                    <button
                      onClick={() => setShowAllHints(!showAllHints)}
                      className="text-xs font-bold text-[#7C3AED] flex items-center gap-1"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      {showAllHints ? 'Collapse' : 'Show all'}
                      <ChevronDown size={14} style={{ transform: showAllHints ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                    </button>
                  )}
                </div>

                {(showAllHints ? visibleHints : visibleHints.slice(-1)).map((hint, i) => (
                  <HintCard
                    key={hint.id}
                    hint={hint}
                    index={visibleHints.indexOf(hint)}
                    isNew={newHintIndex !== null && hint.id === newHintIndex + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <SuccessState hintsUsed={hintsUnlocked} onReset={handleReset} />
      )}

      {/* Mobile sticky input bar */}
      {!isCorrect && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 p-3 border-t border-[#EDE9FE] flex gap-2 z-40"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)' }}
        >
          <input
            type="text"
            maxLength={PUZZLE.letterCount}
            value={answer}
            onChange={e => setAnswer(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Your answer…"
            className="flex-1 py-3 px-4 rounded-2xl border-2 border-[#E0E7FF] focus:border-[#7C3AED] focus:outline-none"
            style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.95rem', textTransform: 'uppercase', background: '#F9F7FF', color: '#1E1B4B' }}
          />
          <button
            onClick={handleSubmit}
            disabled={answer.length !== PUZZLE.letterCount}
            className="px-4 py-3 rounded-2xl disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white' }}
          >
            <Send size={18} />
          </button>
          <button
            onClick={handleHint}
            disabled={hintsUnlocked >= PUZZLE.hints.length}
            className="px-4 py-3 rounded-2xl disabled:opacity-40"
            style={{ background: '#FFF7ED', border: '2px solid #FED7AA', color: '#C2410C' }}
          >
            <Lightbulb size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
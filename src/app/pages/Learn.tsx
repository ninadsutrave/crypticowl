import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mascot } from '../components/Mascot';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import { useDarkMode } from '../context/DarkModeContext';
import { getTheme } from '../theme';

// ─── PARTS OF CLUE ────────────────────────────────────────────────────────────

type CluePartKey = 'fodder' | 'indicator' | 'definition' | null;

const CLUE_SEGMENTS = [
  { key: 'fodder', text: 'Pears' },
  { key: null, text: ' ' },
  { key: 'indicator', text: 'mixed up' },
  { key: null, text: ' to form ' },
  { key: 'definition', text: 'a weapon' },
  { key: null, text: ' (5)' },
] as { key: CluePartKey; text: string }[];

const PART_COLORS: Record<string, { bg: string; bgDark: string; text: string; border: string }> = {
  definition: { bg: '#EFF6FF', bgDark: '#0D1F35', text: '#1D4ED8', border: '#3B82F6' },
  indicator: { bg: '#F5F3FF', bgDark: '#1A0F35', text: '#5B21B6', border: '#7C3AED' },
  fodder: { bg: '#FFF7ED', bgDark: '#2A1505', text: '#C2410C', border: '#F97316' },
  wordplay: { bg: '#ECFDF5', bgDark: '#062010', text: '#065F46', border: '#10B981' },
};

function PartsOfClue({ isDark }: { isDark: boolean }) {
  const [activePart, setActivePart] = useState<CluePartKey>(null);
  const T = getTheme(isDark);

  const parts = [
    {
      key: 'definition' as CluePartKey,
      label: 'Definition',
      emoji: '📖',
      desc: 'The straightforward meaning of the answer. Always at the start or end of a cryptic clue.',
      color: PART_COLORS.definition,
    },
    {
      key: 'indicator' as CluePartKey,
      label: 'Indicator',
      emoji: '🚦',
      desc: "A signal word that tells you what type of wordplay to use. e.g. 'mixed up' = anagram.",
      color: PART_COLORS.indicator,
    },
    {
      key: 'fodder' as CluePartKey,
      label: 'Fodder',
      emoji: '🌾',
      desc: "The raw material to be manipulated according to the indicator. Here, it's the letters you'll rearrange.",
      color: PART_COLORS.fodder,
    },
  ];

  return (
    <div>
      <div
        className="rounded-2xl p-5 mb-5 border shadow-sm text-center"
        style={{ background: T.cardBg, borderColor: T.cardBorder }}
      >
        <p
          style={{
            fontSize: '0.8rem',
            color: T.textFaint,
            fontWeight: 700,
            marginBottom: 8,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          SAMPLE CLUE — CLICK THE CARDS BELOW
        </p>
        <p className="text-lg" style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: T.text, lineHeight: 1.8 }}>
          {CLUE_SEGMENTS.map((seg, i) => (
            <span
              key={i}
              style={
                seg.key && seg.key === activePart
                  ? {
                      background: isDark ? PART_COLORS[seg.key].bgDark : PART_COLORS[seg.key].bg,
                      color: PART_COLORS[seg.key].text,
                      border: `2px solid ${PART_COLORS[seg.key].border}`,
                      borderRadius: 8,
                      padding: '2px 6px',
                      display: 'inline-block',
                      marginInline: 1,
                      fontWeight: 800,
                      transition: 'all 0.2s',
                    }
                  : seg.key
                  ? { opacity: activePart ? 0.4 : 1, transition: 'opacity 0.2s' }
                  : {}
              }
            >
              {seg.text}
            </span>
          ))}
        </p>
        {activePart === null && (
          <p style={{ fontSize: '0.8rem', color: T.textFaint, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>
            ☝️ Click a card below to highlight that part
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {parts.map(part => (
          <motion.button
            key={part.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActivePart(activePart === part.key ? null : part.key)}
            className="text-left p-4 rounded-2xl border-2 transition-all"
            style={{
              borderColor: activePart === part.key ? part.color.border : isDark ? '#3D2A6B' : '#EDE9FE',
              background:
                activePart === part.key
                  ? isDark ? part.color.bgDark : part.color.bg
                  : T.cardBg,
              boxShadow: activePart === part.key ? `0 0 0 3px ${part.color.border}22` : undefined,
            }}
          >
            <div className="text-2xl mb-2">{part.emoji}</div>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: part.color.text, marginBottom: 4 }}>
              {part.label}
            </h3>
            <p style={{ fontSize: '0.8rem', color: isDark ? '#9381CC' : '#6B7280', lineHeight: 1.5 }}>
              {part.desc}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── WORDPLAY TYPES ───────────────────────────────────────────────────────────

const WORDPLAY_TYPES = [
  {
    id: 'anagram',
    label: 'Anagram',
    emoji: '🔀',
    color: '#7C3AED',
    bg: '#F5F0FF',
    bgDark: '#1A0F35',
    border: '#A78BFA',
    desc: "Letters are rearranged (scrambled) to spell the answer. An 'indicator' word signals this.",
    clue: '"Pears mixed up to form a weapon (5)"',
    breakdown: [
      { label: 'Definition', text: 'a weapon', color: PART_COLORS.definition },
      { label: 'Indicator', text: 'mixed up', color: PART_COLORS.indicator },
      { label: 'Fodder', text: 'PEARS', color: PART_COLORS.fodder },
    ],
    answer: 'SPEAR',
    visual: ['P', 'E', 'A', 'R', 'S'],
    visualAnswer: ['S', 'P', 'E', 'A', 'R'],
  },
  {
    id: 'hidden',
    label: 'Hidden Word',
    emoji: '👻',
    color: '#DB2777',
    bg: '#FDF2F8',
    bgDark: '#200818',
    border: '#F472B6',
    desc: 'The answer is literally hidden inside consecutive letters of the clue. Look carefully!',
    clue: '"Oscar hides his vehicle (3)"',
    breakdown: [
      { label: 'Definition', text: 'his vehicle', color: PART_COLORS.definition },
      { label: 'Indicator', text: 'hides', color: PART_COLORS.indicator },
      { label: 'Hidden in', text: 'osCARe', color: PART_COLORS.fodder },
    ],
    answer: 'CAR',
    visual: ['o', 's', 'C', 'A', 'R'],
    visualAnswer: ['C', 'A', 'R'],
  },
  {
    id: 'container',
    label: 'Container',
    emoji: '🫙',
    color: '#059669',
    bg: '#ECFDF5',
    bgDark: '#062010',
    border: '#34D399',
    desc: "One word is placed inside another. Look for words like 'holds', 'contains', 'surrounding'.",
    clue: '"Shell hides a dark place inside (5)"',
    breakdown: [
      { label: 'Definition', text: 'Shell', color: PART_COLORS.definition },
      { label: 'Indicator', text: 'hides ... inside', color: PART_COLORS.indicator },
      { label: 'Contents', text: 'HELL inside S_L', color: PART_COLORS.fodder },
    ],
    answer: 'SHELL',
    visual: ['S', 'H', 'E', 'L', 'L'],
    visualAnswer: ['S', '{HELL}'],
  },
  {
    id: 'reversal',
    label: 'Reversal',
    emoji: '🔄',
    color: '#0284C7',
    bg: '#F0F9FF',
    bgDark: '#021520',
    border: '#38BDF8',
    desc: "Read a word backwards to get the answer. Indicators include 'back', 'returned', 'reversed'.",
    clue: '"The devil, going back, has lived (5)"',
    breakdown: [
      { label: 'Definition', text: 'has lived', color: PART_COLORS.definition },
      { label: 'Indicator', text: 'going back', color: PART_COLORS.indicator },
      { label: 'Reversed', text: 'DEVIL → LIVED', color: PART_COLORS.fodder },
    ],
    answer: 'LIVED',
    visual: ['D', 'E', 'V', 'I', 'L'],
    visualAnswer: ['L', 'I', 'V', 'E', 'D'],
  },
  {
    id: 'deletion',
    label: 'Deletion',
    emoji: '✂️',
    color: '#B45309',
    bg: '#FFFBEB',
    bgDark: '#1A1000',
    border: '#FBBF24',
    desc: "Remove a letter (usually the first or last) from a word. 'Headless' = remove first letter.",
    clue: '"Ghost without its head hosts a party (4)"',
    breakdown: [
      { label: 'Definition', text: 'hosts a party', color: PART_COLORS.definition },
      { label: 'Indicator', text: 'without its head', color: PART_COLORS.indicator },
      { label: 'Deletion', text: 'GHOST – G = HOST', color: PART_COLORS.fodder },
    ],
    answer: 'HOST',
    visual: ['G', 'H', 'O', 'S', 'T'],
    visualAnswer: ['H', 'O', 'S', 'T'],
  },
  {
    id: 'homophone',
    label: 'Homophone',
    emoji: '🎙️',
    color: '#EA580C',
    bg: '#FFF7ED',
    bgDark: '#1A0A00',
    border: '#FB923C',
    desc: "The answer sounds like another word. Look for 'sounds like', 'we hear', 'reportedly'.",
    clue: '"We hear the rain rule (5)"',
    breakdown: [
      { label: 'Definition', text: 'rule', color: PART_COLORS.definition },
      { label: 'Indicator', text: 'We hear', color: PART_COLORS.indicator },
      { label: 'Sounds like', text: 'RAIN → REIGN', color: PART_COLORS.fodder },
    ],
    answer: 'REIGN',
    visual: ['R', 'A', 'I', 'N'],
    visualAnswer: ['R', 'E', 'I', 'G', 'N'],
  },
];

function LetterBox({ letter, color, small }: { letter: string; color: string; small?: boolean }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center font-bold"
      style={{
        width: small ? 28 : 36,
        height: small ? 28 : 36,
        background: color + '22',
        border: `2px solid ${color}`,
        color,
        fontFamily: "'Fredoka One', cursive",
        fontSize: small ? '0.85rem' : '1rem',
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

function WordplayTab({ type, isDark }: { type: (typeof WORDPLAY_TYPES)[0]; isDark: boolean }) {
  const T = getTheme(isDark);
  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded-2xl border-2"
        style={{ borderColor: type.border, background: isDark ? type.bgDark : type.bg }}
      >
        <p
          style={{
            fontSize: '0.9rem',
            color: isDark ? '#C4B5FD' : '#374151',
            fontWeight: 600,
            lineHeight: 1.7,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {type.desc}
        </p>
      </div>

      <div
        className="rounded-2xl p-4 border shadow-sm"
        style={{ background: T.cardBg, borderColor: T.cardBorder }}
      >
        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: T.textFaint, marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>
          EXAMPLE CLUE
        </p>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, color: T.text, fontSize: '0.95rem', marginBottom: 12 }}>
          {type.clue}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {type.breakdown.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-full px-3 py-1"
              style={{
                background: isDark ? b.color.bgDark : b.color.bg,
                border: `1.5px solid ${b.color.border}`,
              }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: b.color.text,
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {b.label}:
              </span>
              <span style={{ fontSize: '0.72rem', color: b.color.text, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                {b.text}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1.5">
            {type.visual.map((l, i) => (
              <LetterBox key={i} letter={l} color={type.color} />
            ))}
          </div>
          <span style={{ color: type.color, fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem', margin: '0 4px' }}>→</span>
          <div className="flex gap-1.5">
            {type.visualAnswer.map((l, i) => (
              <LetterBox key={i} letter={l} color="#059669" />
            ))}
          </div>
          <div className="rounded-full px-3 py-1 ml-1" style={{ background: isDark ? '#062010' : '#ECFDF5', border: '1.5px solid #34D399' }}>
            <span style={{ fontFamily: "'Fredoka One', cursive", color: '#059669', fontSize: '0.9rem' }}>{type.answer}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INDICATORS ───────────────────────────────────────────────────────────────

const INDICATORS = [
  { type: 'Anagram', color: '#7C3AED', bg: '#F5F0FF', bgDark: '#1A0F35', border: '#A78BFA', emoji: '🔀', words: ['mixed', 'wild', 'broken', 'scrambled', 'confused', 'jumbled', 'crazy', 'arranged', 'upset', 'strangely', 'oddly'] },
  { type: 'Reversal', color: '#0284C7', bg: '#F0F9FF', bgDark: '#021520', border: '#38BDF8', emoji: '🔄', words: ['back', 'returned', 'reversed', 'going up', 'east to west', 'over', 'reflected', 'about-face'] },
  { type: 'Hidden', color: '#DB2777', bg: '#FDF2F8', bgDark: '#200818', border: '#F472B6', emoji: '👻', words: ['in', 'within', 'hiding in', 'part of', 'some of', 'found in', 'held by', 'contains'] },
  { type: 'Container', color: '#059669', bg: '#ECFDF5', bgDark: '#062010', border: '#34D399', emoji: '🫙', words: ['holds', 'contains', 'around', 'surrounding', 'inside', 'sheltering', 'embracing', 'swallowing'] },
  { type: 'Deletion', color: '#B45309', bg: '#FFFBEB', bgDark: '#1A1000', border: '#FBBF24', emoji: '✂️', words: ['headless', 'tailless', 'heartless', 'losing', 'without', 'cut', 'almost', 'most of'] },
  { type: 'Homophone', color: '#EA580C', bg: '#FFF7ED', bgDark: '#1A0A00', border: '#FB923C', emoji: '🎙️', words: ['sounds like', 'we hear', 'reportedly', 'audibly', 'spoken', 'say', 'aloud', 'on the radio'] },
];

// ─── SYNONYMS ─────────────────────────────────────────────────────────────────

const SYNONYMS = [
  { word: 'flower', cryptic: 'river', note: 'something that flows' },
  { word: 'doctor', cryptic: 'DR / MB / MD', note: 'medical title' },
  { word: 'east', cryptic: 'E', note: 'compass point' },
  { word: 'left', cryptic: 'L', note: 'compass / direction' },
  { word: 'north', cryptic: 'N', note: 'compass point' },
  { word: 'south', cryptic: 'S', note: 'compass point' },
  { word: 'west', cryptic: 'W', note: 'compass point' },
  { word: 'king', cryptic: 'K / R / ER', note: 'royalty' },
  { word: 'queen', cryptic: 'Q / HM / R', note: 'royalty' },
  { word: 'article', cryptic: 'A / AN / THE', note: 'grammar word' },
  { word: 'hundred', cryptic: 'C / TON', note: 'number' },
  { word: 'note', cryptic: 'A–G / DO / RE / MI', note: 'musical note' },
  { word: 'old', cryptic: 'O / EX', note: 'prefix meaning former' },
  { word: 'river', cryptic: 'NILE / EXE / DEE', note: 'UK rivers (short names)' },
  { word: 'saint', cryptic: 'ST', note: 'abbreviation' },
  { word: 'street', cryptic: 'ST / RD', note: 'abbreviation' },
  { word: 'small', cryptic: 'S / WEE', note: 'size' },
  { word: 'large', cryptic: 'L / BIG', note: 'size' },
  { word: 'number', cryptic: 'NO / NB', note: 'abbreviation' },
  { word: 'gold', cryptic: 'OR / AU', note: 'heraldry / chemistry' },
  { word: 'silver', cryptic: 'AG', note: 'chemistry symbol' },
  { word: 'right', cryptic: 'R / RT', note: 'direction / correct' },
  { word: 'answer', cryptic: 'A / ANS', note: 'abbreviated' },
  { word: 'about', cryptic: 'C / CA / RE', note: 'circa / regarding' },
];

// ─── MAIN LEARN PAGE ──────────────────────────────────────────────────────────

const SECTIONS = ['Intro', 'Parts', 'Wordplay', 'Indicators', 'Synonyms'];

export function Learn() {
  const [activeSection, setActiveSection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(null);
  const { isDark } = useDarkMode();
  const T = getTheme(isDark);

  const filteredSynonyms = SYNONYMS.filter(
    s =>
      s.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.cryptic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="py-8 text-center">
        <div className="flex justify-center mb-4">
          <Mascot mood="thinking" size={90} speechBubble="Let's crack the code together! 🔍" bubbleDirection="right" animate />
        </div>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '2.2rem', color: isDark ? '#C4B5FD' : '#1E1B4B', marginBottom: 8 }}>
          Learn Cryptics
        </h1>
        <p style={{ color: T.textMuted, fontWeight: 600, fontSize: '1rem' }}>
          Your beginner's guide to cryptic crossword clues
        </p>
      </div>

      {/* Section Nav */}
      <div
        className="sticky top-16 z-30 py-3 mb-8"
        style={{ background: T.stickyNavBg, backdropFilter: 'blur(12px)' }}
      >
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {SECTIONS.map((s, i) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveSection(i)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 700,
                background: activeSection === i ? '#7C3AED' : T.cardBg,
                color: activeSection === i ? 'white' : isDark ? '#C4B5FD' : '#6D28D9',
                border: `2px solid ${activeSection === i ? '#7C3AED' : isDark ? '#3D2A6B' : '#EDE9FE'}`,
                boxShadow: activeSection === i ? '0 4px 12px rgba(124,58,237,0.3)' : undefined,
              }}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
        >
          {/* ── SECTION 0: Intro ── */}
          {activeSection === 0 && (
            <div className="space-y-6">
              <div
                className="rounded-3xl p-6 border shadow-sm"
                style={{ background: T.cardBg, borderColor: T.cardBorder }}
              >
                <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: isDark ? '#C4B5FD' : '#1E1B4B', marginBottom: 12 }}>
                  What is a Cryptic Clue? 🔍
                </h2>
                <p style={{ fontSize: '0.95rem', color: isDark ? '#C4B5FD' : '#374151', lineHeight: 1.8, fontWeight: 500 }}>
                  A cryptic clue is like a little word puzzle within a puzzle. Unlike regular crossword clues which are simple synonyms,{' '}
                  <strong>every cryptic clue has two parts</strong>:
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 rounded-2xl p-4" style={{ background: isDark ? '#0D1F35' : '#EFF6FF', border: '2px solid #3B82F6' }}>
                    <p style={{ fontFamily: "'Fredoka One', cursive", color: '#1D4ED8', fontSize: '1rem', marginBottom: 4 }}>1. The Definition</p>
                    <p style={{ fontSize: '0.85rem', color: isDark ? '#93C5FD' : '#1E40AF', lineHeight: 1.6 }}>A straightforward clue to the answer, always at the very start or end of the clue.</p>
                  </div>
                  <div className="flex-1 rounded-2xl p-4" style={{ background: isDark ? '#2A1505' : '#FFF7ED', border: '2px solid #F97316' }}>
                    <p style={{ fontFamily: "'Fredoka One', cursive", color: '#C2410C', fontSize: '1rem', marginBottom: 4 }}>2. The Wordplay</p>
                    <p style={{ fontSize: '0.85rem', color: isDark ? '#FED7AA' : '#9A3412', lineHeight: 1.6 }}>A clever trick — anagram, hidden word, reversal — that arrives at the same answer differently.</p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-3xl p-6 border shadow-sm"
                style={{ background: T.cardBg, borderColor: T.cardBorder }}
              >
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.2rem', color: isDark ? '#C4B5FD' : '#1E1B4B', marginBottom: 4 }}>
                  The Golden Rule
                </h3>
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{ background: isDark ? '#261845' : '#F9F7FF', border: `2px dashed ${isDark ? '#4C3580' : '#C4B5FD'}` }}
                >
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: T.text, textAlign: 'center' }}>
                    "Pears{' '}
                    <span style={{ background: isDark ? '#1A0F35' : '#F5F3FF', color: '#5B21B6', border: '1.5px solid #7C3AED', borderRadius: 6, padding: '1px 5px' }}>
                      mixed up
                    </span>{' '}
                    to form{' '}
                    <span style={{ background: isDark ? '#0D1F35' : '#EFF6FF', color: '#1D4ED8', border: '1.5px solid #3B82F6', borderRadius: 6, padding: '1px 5px' }}>
                      a weapon
                    </span>{' '}
                    (5)"
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { dot: '#3B82F6', text: '"a weapon" is the definition (= SPEAR)' },
                    { dot: '#7C3AED', text: '"mixed up" tells you to make an anagram' },
                    { dot: '#F97316', text: '"Pears" is the fodder — rearrange its letters → SPEAR!' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ background: item.dot }} />
                      <p style={{ fontSize: '0.88rem', color: isDark ? '#C4B5FD' : '#374151', lineHeight: 1.6 }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveSection(1)}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}
              >
                Learn about Parts of a Clue <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── SECTION 1: Parts of a Clue ── */}
          {activeSection === 1 && (
            <div className="space-y-6">
              <div>
                <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: isDark ? '#C4B5FD' : '#1E1B4B', marginBottom: 4 }}>
                  Parts of a Clue 🧩
                </h2>
                <p style={{ fontSize: '0.9rem', color: T.textMuted, fontWeight: 600, marginBottom: 16 }}>
                  Click each part card to highlight it in the example clue above
                </p>
                <PartsOfClue isDark={isDark} />
              </div>

              <div
                className="rounded-3xl p-5 border shadow-sm"
                style={{ background: T.cardBg, borderColor: T.cardBorder }}
              >
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.1rem', color: isDark ? '#C4B5FD' : '#1E1B4B', marginBottom: 8 }}>
                  The Number at the End
                </h3>
                <p style={{ fontSize: '0.88rem', color: isDark ? '#C4B5FD' : '#374151', lineHeight: 1.7 }}>
                  That <strong>(5)</strong> at the end? That's the letter count! It tells you how many letters are in the answer.
                  Sometimes you'll see <strong>(3-5)</strong> for hyphenated answers or <strong>(3,4)</strong> for two-word answers.
                </p>
              </div>

              <button
                onClick={() => setActiveSection(2)}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}
              >
                Explore Wordplay Types <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── SECTION 2: Wordplay Types ── */}
          {activeSection === 2 && (
            <div className="space-y-6">
              <div>
                <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: isDark ? '#C4B5FD' : '#1E1B4B', marginBottom: 4 }}>
                  Types of Wordplay 🎭
                </h2>
                <p style={{ fontSize: '0.9rem', color: T.textMuted, fontWeight: 600, marginBottom: 16 }}>
                  There are 6 main types. Learn them all and you'll crack most cryptic clues!
                </p>
              </div>
              <Tabs.Root defaultValue="anagram">
                <Tabs.List className="flex gap-2 flex-wrap mb-5">
                  {WORDPLAY_TYPES.map(t => (
                    <Tabs.Trigger
                      key={t.id}
                      value={t.id}
                      className="px-3 py-2 rounded-full text-xs transition-all border-2 data-[state=active]:text-white"
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 700,
                        borderColor: t.border,
                        background: 'transparent',
                        color: t.color,
                      } as any}
                    >
                      {t.emoji} {t.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>
                {WORDPLAY_TYPES.map(t => (
                  <Tabs.Content key={t.id} value={t.id}>
                    <WordplayTab type={t} isDark={isDark} />
                  </Tabs.Content>
                ))}
              </Tabs.Root>

              <button
                onClick={() => setActiveSection(3)}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}
              >
                See Common Indicators <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── SECTION 3: Indicators ── */}
          {activeSection === 3 && (
            <div className="space-y-6">
              <div>
                <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: isDark ? '#C4B5FD' : '#1E1B4B', marginBottom: 4 }}>
                  Common Indicators 🚦
                </h2>
                <p style={{ fontSize: '0.9rem', color: T.textMuted, fontWeight: 600, marginBottom: 0 }}>
                  These are the "signal words" that tell you what type of wordplay to use.
                </p>
              </div>

              {INDICATORS.map((group, gi) => (
                <div
                  key={gi}
                  className="rounded-3xl overflow-hidden border shadow-sm"
                  style={{ background: T.cardBg, borderColor: T.cardBorder }}
                >
                  <button
                    className="w-full flex items-center justify-between p-4 transition-colors"
                    style={{ background: 'transparent' }}
                    onClick={() => setExpandedAccordion(expandedAccordion === gi ? null : gi)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{group.emoji}</span>
                      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.05rem', color: group.color }}>{group.type}</span>
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: isDark ? group.bgDark : group.bg, color: group.color }}>
                        {group.words.length} indicators
                      </span>
                    </div>
                    <motion.div animate={{ rotate: expandedAccordion === gi ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={18} style={{ color: group.color }} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedAccordion === gi && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <div className="flex flex-wrap gap-2">
                            {group.words.map((w, wi) => (
                              <motion.span
                                key={wi}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: wi * 0.03 }}
                                className="px-3 py-1.5 rounded-full text-sm font-semibold"
                                style={{
                                  background: isDark ? group.bgDark : group.bg,
                                  color: group.color,
                                  border: `1.5px solid ${group.border}`,
                                  fontFamily: "'Nunito', sans-serif",
                                }}
                              >
                                {w}
                              </motion.span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <button
                onClick={() => setActiveSection(4)}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}
              >
                Synonyms & Abbreviations <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── SECTION 4: Synonyms ── */}
          {activeSection === 4 && (
            <div className="space-y-6">
              <div>
                <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color: isDark ? '#C4B5FD' : '#1E1B4B', marginBottom: 4 }}>
                  Synonyms & Abbreviations 📚
                </h2>
                <p style={{ fontSize: '0.9rem', color: T.textMuted, fontWeight: 600, marginBottom: 16 }}>
                  Cryptic setters love these sneaky shorthand meanings. Search to find them!
                </p>

                <div className="relative mb-4">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A78BFA]" />
                  <input
                    type="text"
                    placeholder="Search word or abbreviation..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 focus:outline-none transition-colors"
                    style={{
                      borderColor: isDark ? '#3D2A6B' : '#EDE9FE',
                      background: T.cardBg,
                      color: T.text,
                      fontFamily: "'Nunito', sans-serif",
                      fontSize: '0.9rem',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#7C3AED')}
                    onBlur={e => (e.target.style.borderColor = isDark ? '#3D2A6B' : '#EDE9FE')}
                  />
                </div>
              </div>

              <div
                className="rounded-3xl border shadow-sm overflow-hidden"
                style={{ background: T.cardBg, borderColor: T.cardBorder }}
              >
                <div
                  className="grid grid-cols-3 px-4 py-3 border-b"
                  style={{ background: T.tableHeaderBg, borderColor: T.cardBorder }}
                >
                  {['Common Word', 'Cryptic Meaning', 'Notes'].map(h => (
                    <span
                      key={h}
                      style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: T.textMuted, textTransform: 'uppercase' }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {filteredSynonyms.length === 0 ? (
                  <div className="p-8 text-center">
                    <p style={{ color: T.textFaint, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                      No results for "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  filteredSynonyms.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="grid grid-cols-3 px-4 py-3 border-b transition-colors cursor-default"
                      style={{ borderColor: T.tableRowBorder }}
                    >
                      <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: T.text }}>{s.word}</span>
                      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.9rem', color: '#7C3AED' }}>{s.cryptic}</span>
                      <span style={{ fontSize: '0.8rem', color: T.textMuted, fontFamily: "'Nunito', sans-serif" }}>{s.note}</span>
                    </motion.div>
                  ))
                )}
              </div>

              <div
                className="rounded-3xl p-5 border-2 flex items-start gap-4"
                style={{ background: isDark ? '#2A1505' : '#FFF7ED', borderColor: isDark ? '#92400E' : '#FED7AA' }}
              >
                <Mascot mood="hint" size={70} animate={false} />
                <div>
                  <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: '#C2410C', marginBottom: 4 }}>
                    Pro Tip from Ollie the Owl!
                  </p>
                  <p style={{ fontSize: '0.85rem', color: isDark ? '#FED7AA' : '#92400E', lineHeight: 1.7, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                    In cryptic crosswords, "flower" almost always means a <em>river</em> (something that flows)!
                    These "non-obvious" meanings trip up beginners. Bookmark this list! 🔖
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
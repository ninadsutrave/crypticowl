import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mascot } from '../components/Mascot';
import { BookOpen, Zap, Trophy, ChevronRight, Star, Lightbulb } from 'lucide-react';

const FLOAT_ITEMS = [
  { char: 'E', x: '5%', y: '12%', size: 52, delay: 0, color: '#C4B5FD' },
  { char: 'A', x: '88%', y: '8%', size: 40, delay: 0.5, color: '#A7F3D0' },
  { char: '?', x: '92%', y: '35%', size: 46, delay: 1, color: '#FDE68A' },
  { char: 'T', x: '3%', y: '55%', size: 38, delay: 1.5, color: '#BAE6FD' },
  { char: 'R', x: '90%', y: '62%', size: 50, delay: 0.8, color: '#FCA5A5' },
  { char: 'S', x: '7%', y: '80%', size: 44, delay: 1.2, color: '#C4B5FD' },
  { char: '★', x: '85%', y: '85%', size: 36, delay: 0.3, color: '#FDE68A' },
  { char: 'N', x: '15%', y: '30%', size: 30, delay: 0.7, color: '#A7F3D0' },
  { char: 'I', x: '78%', y: '20%', size: 28, delay: 1.8, color: '#BAE6FD' },
];

function FloatingBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {FLOAT_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{ left: item.x, top: item.y, fontSize: item.size, color: item.color, fontFamily: "'Fredoka One', cursive", opacity: 0.12 }}
          animate={{ y: [0, -18, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5 + i * 0.4, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {item.char}
        </motion.div>
      ))}
      {/* Puzzle grid dots */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`grid-${i}`}
          className="absolute w-16 h-16 opacity-[0.04]"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 30}%`, border: '2px solid #7C3AED', borderRadius: 4 }}
        />
      ))}
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-white rounded-3xl px-5 py-4 shadow-sm border border-[#EDE9FE]">
      <span className="text-2xl">{icon}</span>
      <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.5rem', color }}>{value}</span>
      <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

function TodaysPuzzlePreview({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-white rounded-3xl p-6 shadow-lg border border-[#EDE9FE] cursor-pointer max-w-sm w-full"
      onClick={onNavigate}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.85rem', color: '#7C3AED' }}>CRYPTIC #42</p>
          <p style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 600 }}>April 1, 2026</p>
        </div>
        <div className="bg-[#F5F0FF] rounded-2xl px-3 py-1.5">
          <span style={{ fontSize: '0.78rem', color: '#7C3AED', fontWeight: 700 }}>5 letters</span>
        </div>
      </div>
      <div className="bg-[#F9F7FF] rounded-2xl p-4 mb-4 text-center">
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', color: '#1E1B4B', fontWeight: 600, lineHeight: 1.6 }}>
          "Pears mixed up to form a weapon (5)"
        </p>
      </div>
      {/* Answer boxes */}
      <div className="flex gap-2 justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-10 h-10 rounded-xl border-2 border-[#C4B5FD] bg-[#F5F0FF] flex items-center justify-center">
            <span style={{ fontFamily: "'Fredoka One', cursive", color: '#C4B5FD', fontSize: '1.2rem' }}>?</span>
          </div>
        ))}
      </div>
      <button
        className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-98"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.9rem' }}
      >
        Solve Now <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}

function HowItWorks() {
  const steps = [
    { emoji: '🔍', title: 'Read the Clue', desc: 'Every cryptic clue has two parts: a definition and wordplay.' },
    { emoji: '🧩', title: 'Decode the Wordplay', desc: 'Spot anagram indicators, hidden words, and other tricks.' },
    { emoji: '💡', title: 'Use Hints', desc: 'Stuck? Our hints reveal the clue step-by-step without spoiling everything.' },
    { emoji: '🎉', title: 'Celebrate!', desc: 'Solve it and share your result — just like Wordle, but nerdier.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem', color: '#1E1B4B' }}>How it works</h2>
        <p style={{ color: '#6B7280', fontWeight: 600, marginTop: 4, fontSize: '0.95rem' }}>
          Four simple steps to cryptic crossword mastery
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-3xl p-6 text-center shadow-sm border border-[#EDE9FE]"
          >
            <div className="text-3xl mb-3">{step.emoji}</div>
            <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center mx-auto mb-3" style={{ fontFamily: "'Fredoka One', cursive", fontSize: '0.85rem' }}>
              {i + 1}
            </div>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.05rem', color: '#1E1B4B', marginBottom: 6 }}>{step.title}</h3>
            <p style={{ fontSize: '0.83rem', color: '#6B7280', lineHeight: 1.6 }}>{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LearnPreviewSection({ onNavigate }: { onNavigate: () => void }) {
  const topics = [
    { icon: '🔀', title: 'Anagram', color: '#A78BFA', bg: '#F5F0FF', desc: 'Letters scrambled to form a new word' },
    { icon: '🫙', title: 'Container', color: '#34D399', bg: '#ECFDF5', desc: 'One word hidden inside another' },
    { icon: '🔄', title: 'Reversal', color: '#38BDF8', bg: '#F0F9FF', desc: 'Read a word backwards for the answer' },
    { icon: '🎙️', title: 'Homophone', color: '#FB923C', bg: '#FFF7ED', desc: 'The answer sounds like another word' },
    { icon: '👻', title: 'Hidden Word', color: '#F472B6', bg: '#FDF2F8', desc: 'Answer concealed within the clue' },
    { icon: '✂️', title: 'Deletion', color: '#FBBF24', bg: '#FFFBEB', desc: 'Remove letters to find the answer' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem', color: '#1E1B4B' }}>Types of Wordplay</h2>
        <button
          onClick={onNavigate}
          className="flex items-center gap-1.5 text-sm font-bold text-[#7C3AED] hover:text-[#5B21B6] transition-colors"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          Learn all <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {topics.map((topic, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNavigate}
            className="rounded-2xl p-4 cursor-pointer border-2 transition-all"
            style={{ background: topic.bg, borderColor: topic.color + '40' }}
          >
            <div className="text-2xl mb-2">{topic.icon}</div>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1rem', color: topic.color, marginBottom: 4 }}>{topic.title}</h3>
            <p style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.5 }}>{topic.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      <FloatingBg />

      {/* Hero */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10 pb-12">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left: Text */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#EDE9FE] border border-[#C4B5FD] rounded-full px-4 py-1.5 mb-5">
                <Star size={14} className="text-[#7C3AED]" fill="#7C3AED" />
                <span style={{ fontSize: '0.8rem', color: '#5B21B6', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
                  Free daily cryptic puzzle!
                </span>
              </div>
              <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', color: '#1E1B4B', lineHeight: 1.15, marginBottom: 16 }}>
                Cryptic crosswords,<br />
                <span style={{ color: '#7C3AED' }}>finally explained.</span>
              </h1>
              <p style={{ fontSize: '1.05rem', color: '#4B5563', lineHeight: 1.7, marginBottom: 28, fontWeight: 500 }}>
                Learn the art of cryptic clues step by step. Solve daily puzzles, collect hints, and build your skills — no crossword experience needed!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/puzzle')}
                  className="px-7 py-3.5 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem' }}
                >
                  <Zap size={18} /> Solve Today's Clue
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/learn')}
                  className="px-7 py-3.5 rounded-full border-2 border-[#C4B5FD] flex items-center justify-center gap-2 transition-all hover:bg-[#F5F0FF]"
                  style={{ color: '#5B21B6', fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem', background: 'white' }}
                >
                  <BookOpen size={18} /> Learn Cryptics
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right: Mascot + Bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-shrink-0 flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-max">
                <div className="bg-white border-2 border-[#C4B5FD] rounded-2xl px-4 py-2.5 shadow-lg" style={{ borderRadius: '16px 16px 16px 4px' }}>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '0.85rem', color: '#4C1D95', fontWeight: 700 }}>
                    Let's solve your first cryptic clue! 🎉
                  </p>
                </div>
              </div>
              <Mascot mood="celebrating" size={160} animate />
            </div>
          </motion.div>
        </div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-3 justify-center"
        >
          <StatCard icon="🔥" value="3" label="Day Streak" color="#EA580C" />
          <StatCard icon="🧩" value="42" label="Puzzles Solved" color="#7C3AED" />
          <StatCard icon="💡" value="2.4" label="Avg Hints" color="#0EA5E9" />
          <StatCard icon="🏆" value="Top 15%" label="This Week" color="#D97706" />
        </motion.div>
      </div>

      {/* Today's Puzzle Preview */}
      <div className="relative z-10 px-4 pb-14">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.8rem', color: '#1E1B4B' }}>Today's Puzzle</h2>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 600, marginTop: 4 }}>Can you crack it without any hints?</p>
            </div>
            <TodaysPuzzlePreview onNavigate={() => navigate('/puzzle')} />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10">
        <HowItWorks />
      </div>

      {/* Wordplay Types Preview */}
      <div className="relative z-10">
        <LearnPreviewSection onNavigate={() => navigate('/learn')} />
      </div>

      {/* Bottom CTA Banner */}
      <div className="relative z-10 px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
          >
            <div className="absolute top-0 right-0 opacity-10 text-[120px]" style={{ fontFamily: "'Fredoka One', cursive", color: 'white', lineHeight: 1 }}>?</div>
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <Mascot mood="hint" size={80} animate={false} />
              </div>
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '1.7rem', color: 'white', marginBottom: 8 }}>
                Ready to become a cryptic master?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: 20, fontSize: '0.95rem' }}>
                Start with our beginner guide — we promise it's not as scary as it sounds!
              </p>
              <button
                onClick={() => navigate('/learn')}
                className="px-8 py-3 rounded-full bg-white hover:bg-[#F5F0FF] transition-all font-bold"
                style={{ color: '#7C3AED', fontFamily: "'Nunito', sans-serif", fontSize: '0.95rem', fontWeight: 800 }}
              >
                Start Learning for Free →
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

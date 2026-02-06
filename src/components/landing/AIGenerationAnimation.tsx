"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check } from "lucide-react";

type Phase = 0 | 1 | 2;

const PHASE_DURATIONS = [3500, 3000, 4000];
const TRANSITION_MS = 400;
const INITIAL_DELAY = 700;

const NOTE_LINES = [
  "The mitochondria is the powerhouse of the cell...",
  "ATP is produced through oxidative phosphorylation...",
  "The electron transport chain consists of four complexes...",
  "NADH and FADH2 are electron carriers that donate...",
  "Chemiosmosis drives ATP synthase to produce ATP...",
];

const QUIZ_OPTIONS = [
  { letter: "A", text: "Energy storage in adipose tissue" },
  { letter: "B", text: "ATP production through cellular respiration" },
  { letter: "C", text: "Protein synthesis for cell growth" },
  { letter: "D", text: "DNA replication during mitosis" },
];

const CORRECT_INDEX = 1;

export function AIGenerationAnimation() {
  const [phase, setPhase] = useState<Phase>(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [started, setStarted] = useState(false);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quizTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearQuizTimers = useCallback(() => {
    quizTimers.current.forEach(clearTimeout);
    quizTimers.current = [];
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => setStarted(true), INITIAL_DELAY);
    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    if (!started) return;

    const scheduleNext = () => {
      phaseTimerRef.current = setTimeout(() => {
        setIsTransitioning(true);
        transitionTimerRef.current = setTimeout(() => {
          setPhase((prev) => ((prev + 1) % 3) as Phase);
          setIsTransitioning(false);
          setQuizStep(0);
        }, TRANSITION_MS);
      }, PHASE_DURATIONS[phase]);
    };

    scheduleNext();

    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [phase, started]);

  useEffect(() => {
    if (phase !== 2 || isTransitioning) {
      clearQuizTimers();
      return;
    }

    const t1 = setTimeout(() => setQuizStep(1), 1500);
    const t2 = setTimeout(() => setQuizStep(2), 2200);
    quizTimers.current = [t1, t2];

    return clearQuizTimers;
  }, [phase, isTransitioning, clearQuizTimers]);

  if (!started) {
    return <div className="min-h-[280px]" />;
  }

  const animClass = isTransitioning ? "landing-phase-out" : "landing-phase-in";

  return (
    <div className={`min-h-[280px] ${animClass}`}>
      {phase === 0 && <RawTextPhase />}
      {phase === 1 && <AIProcessingPhase />}
      {phase === 2 && <QuizPhase quizStep={quizStep} />}
    </div>
  );
}

function RawTextPhase() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-white/20" />
        <span className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
          Study Notes
        </span>
      </div>
      {NOTE_LINES.map((line, i) => (
        <p
          key={i}
          className="font-mono text-xs text-white/40 leading-relaxed landing-typewriter"
          style={{ animationDelay: `${i * 200}ms` }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

function AIProcessingPhase() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-teal-400/60 animate-pulse" />
        <span className="text-[11px] font-mono text-teal-400/60 uppercase tracking-wider">
          Analyzing content...
        </span>
      </div>
      {NOTE_LINES.map((line, i) => (
        <p
          key={i}
          className="font-mono text-xs leading-relaxed landing-shimmer-text"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          {line}
        </p>
      ))}
      <div className="flex items-center gap-1 mt-3">
        <span className="inline-block w-1.5 h-4 bg-teal-400 rounded-sm landing-cursor" />
      </div>
    </div>
  );
}

function QuizPhase({ quizStep }: { quizStep: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-amber-400/60" />
        <span className="text-[11px] font-mono text-amber-400/60 uppercase tracking-wider">
          Generated Quiz
        </span>
      </div>
      <p className="text-white/80 font-semibold text-sm leading-snug">
        What is the primary function of mitochondria in eukaryotic cells?
      </p>
      <div className="space-y-2">
        {QUIZ_OPTIONS.map((opt, i) => {
          const isCorrect = i === CORRECT_INDEX;
          const isSelected = isCorrect && quizStep >= 1;

          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all duration-500 ${
                isSelected
                  ? "bg-teal-400/20 border border-teal-400/40 landing-option-highlight"
                  : "bg-white/[0.04] border border-white/[0.08]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-500 ${
                  isSelected
                    ? "bg-teal-400 text-white"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {opt.letter}
              </span>
              <span className={`transition-colors duration-500 ${isSelected ? "text-white/90" : "text-white/60"}`}>
                {opt.text}
              </span>
              {isCorrect && quizStep >= 2 && (
                <Check
                  size={14}
                  className="ml-auto text-teal-400 shrink-0 landing-checkmark-in"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

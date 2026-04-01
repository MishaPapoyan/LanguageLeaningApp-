"use client";

import { LEARNING_PATH } from "@/data/learning-path";
import Link from "next/link";
import { useState, useEffect } from "react";

const typeBgs: Record<string, string> = {
  alphabet: "bg-amber-50",
  pronunciation: "bg-rose-50",
  vocabulary: "bg-sky-50",
  grammar: "bg-violet-50",
  conversation: "bg-emerald-50",
  culture: "bg-cyan-50",
};

export default function LearnPage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("completedLessons");
    if (saved) setCompletedLessons(JSON.parse(saved));
  }, []);

  const isTopicUnlocked = (topic: (typeof LEARNING_PATH)[number]) => {
    if (!topic.requiredTopicId) return true;
    const requiredTopic = LEARNING_PATH.find((t) => t.id === topic.requiredTopicId);
    if (!requiredTopic) return true;
    return requiredTopic.lessons.every((l) => completedLessons.includes(l.id));
  };

  const getTopicProgress = (topic: (typeof LEARNING_PATH)[number]) => {
    const done = topic.lessons.filter((l) => completedLessons.includes(l.id)).length;
    return { done, total: topic.lessons.length, pct: Math.round((done / topic.lessons.length) * 100) };
  };

  const totalLessons = LEARNING_PATH.reduce((sum, t) => sum + t.lessons.length, 0);

  return (
    <div className="max-w-3xl">
      {/* Progress overview */}
      <div className="flex items-center gap-4 mb-6 bg-white rounded-2xl p-4 border border-zinc-100">
        <div className="w-12 h-12 rounded-full border-[3px] border-zinc-100 flex items-center justify-center relative flex-shrink-0">
          <span className="text-xs font-bold text-violet-600">
            {Math.round((completedLessons.length / totalLessons) * 100)}%
          </span>
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${(completedLessons.length / totalLessons) * 125.6} 125.6`} />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-700">{completedLessons.length} of {totalLessons} lessons complete</p>
          <div className="h-1.5 bg-zinc-100 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full rounded-full bg-violet-500 transition-all duration-700"
              style={{ width: `${Math.max((completedLessons.length / totalLessons) * 100, 1)}%` }} />
          </div>
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-3">
        {LEARNING_PATH.map((topic, index) => {
          const unlocked = isTopicUnlocked(topic);
          const progress = getTopicProgress(topic);
          const isComplete = progress.pct === 100;

          return (
            <div key={topic.id} className={`bg-white rounded-2xl border border-zinc-100 overflow-hidden ${!unlocked ? "opacity-40" : ""}`}>
              {/* Topic header */}
              <div className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  isComplete ? "bg-emerald-50" : unlocked ? "bg-violet-50" : "bg-zinc-100"
                }`}>
                  {isComplete ? "✓" : topic.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg text-zinc-900">{topic.title}</h3>
                    {isComplete && <span className="badge-green">Done</span>}
                    {!unlocked && <span className="badge-gray">Locked</span>}
                  </div>
                  <p className="text-xs text-zinc-400">{topic.description}</p>
                </div>
                <span className="text-xs font-medium text-zinc-400">{progress.done}/{progress.total}</span>
              </div>

              {/* Lessons */}
              {unlocked && (
                <div className="border-t border-zinc-50 divide-y divide-zinc-50">
                  {topic.lessons.map((lesson) => {
                    const done = completedLessons.includes(lesson.id);
                    return (
                      <Link key={lesson.id} href={`/learn/${lesson.id}`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors active:scale-[0.99]">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          done ? "bg-emerald-100 text-emerald-600" : `${typeBgs[lesson.type] || "bg-zinc-50"} text-zinc-600`
                        }`}>
                          {done ? "✓" : lesson.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${done ? "text-zinc-400" : "text-zinc-700"}`}>{lesson.title}</p>
                        </div>
                        <svg className="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

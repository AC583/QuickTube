"use client";

import { useState } from "react";
import { Brain, CheckCircle, XCircle, RotateCcw, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false";
  question: string;
  options?: string[];
  correctAnswer: number;
  explanation: string;
}

export function QuizPanel({ videoId }: { videoId: string }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        body: JSON.stringify({ videoId }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setQuestions(data.questions);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setAnswers([]);
      setQuizComplete(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    setShowExplanation(true);
  };

  const handleNext = () => {
    const newAnswers = [...answers, selectedAnswer!];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setQuizComplete(false);
    setError(null);
  };

  const currentQuestion = questions[currentIndex];
  const scoreDelta = showExplanation && selectedAnswer !== null && currentQuestion && selectedAnswer === currentQuestion.correctAnswer ? 1 : 0;
  const score = answers.filter((a, i) => questions[i] && a === questions[i].correctAnswer).length + scoreDelta;

  if (questions.length === 0 && !loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <Brain className="w-12 h-12 text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-sm mb-6">
            Test your understanding of the video content with quiz questions generated from the transcript.
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        <button
          onClick={startQuiz}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Quiz
            </>
          )}
        </button>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    let message = "";
    if (percentage >= 80) message = "Excellent! You really understood the content.";
    else if (percentage >= 60) message = "Good job! You have a solid grasp of the material.";
    else message = "Keep learning! Review the video for better understanding.";

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold">{percentage}%</span>
          </div>
          <p className="text-zinc-400 text-sm mb-2">
            You got {score} out of {questions.length} correct
          </p>
          <p className="text-zinc-500 text-sm">{message}</p>
        </div>
        <button
          onClick={handleRestart}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Take Another Quiz
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-zinc-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-xs text-zinc-500">Score: {score}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mb-2">
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
              currentQuestion.type === "multiple_choice"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-purple-500/20 text-purple-400"
            )}
          >
            {currentQuestion.type === "multiple_choice" ? "Multiple Choice" : "True/False"}
          </span>
        </div>

        <h3 className="text-sm font-medium mb-4">{currentQuestion.question}</h3>

        <div className="space-y-2">
          {currentQuestion.options?.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showExplanation}
              className={cn(
                "w-full text-left p-3 rounded-xl text-sm transition-all",
                selectedAnswer === i
                  ? "bg-white text-black"
                  : "bg-white/5 border border-white/10 hover:bg-white/10",
                showExplanation &&
                  i === currentQuestion.correctAnswer &&
                  "bg-green-500/20 border-green-500/50 text-green-400",
                showExplanation &&
                  selectedAnswer === i &&
                  i !== currentQuestion.correctAnswer &&
                  "bg-red-500/20 border-red-500/50 text-red-400"
              )}
            >
              <div className="flex items-center gap-3">
                {showExplanation && i === currentQuestion.correctAnswer && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {showExplanation && selectedAnswer === i && i !== currentQuestion.correctAnswer && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                {option}
              </div>
            </button>
          ))}
          {!currentQuestion.options && (
            <div className="flex gap-2">
              {[0, 1].map((i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showExplanation}
                  className={cn(
                    "flex-1 p-3 rounded-xl text-sm transition-all",
                    selectedAnswer === i
                      ? "bg-white text-black"
                      : "bg-white/5 border border-white/10 hover:bg-white/10",
                    showExplanation &&
                      i === currentQuestion.correctAnswer &&
                      "bg-green-500/20 border-green-500/50 text-green-400",
                    showExplanation &&
                      selectedAnswer === i &&
                      i !== currentQuestion.correctAnswer &&
                      "bg-red-500/20 border-red-500/50 text-red-400"
                  )}
                >
                  {i === 0 ? "True" : "False"}
                </button>
              ))}
            </div>
          )}
        </div>

        {showExplanation && (
          <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-xs text-zinc-400 mb-1">Explanation:</p>
            <p className="text-xs text-zinc-300">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        {!showExplanation ? (
          <button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors"
          >
            {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}
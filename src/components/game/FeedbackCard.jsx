export default function FeedbackCard({ correct, scoreEarned, lesson, attemptsRemaining, onContinue, onRetry }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6">
      <p className={`text-3xl font-black ${correct ? 'text-emerald-300' : 'text-red-300'}`}>{correct ? '✓ Correct!' : '✕ Incorrect'}</p>
      <p className="mt-3 text-slate-300">{correct ? "You've solved the puzzle." : 'Review the evidence and try again.'}</p>
      {correct ? <p className="mt-3 text-cyan-200">Score Earned: +{scoreEarned}</p> : <p className="mt-3 text-slate-400">Attempts Remaining: {attemptsRemaining}</p>}
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Lesson Learned</p>
        <p className="mt-2 text-slate-200">{lesson}</p>
      </div>
      <div className="mt-6 flex gap-3">
        {correct ? (
          <button type="button" onClick={onContinue} className="rounded-2xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
            Continue
          </button>
        ) : (
          <button type="button" onClick={onRetry} className="rounded-2xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

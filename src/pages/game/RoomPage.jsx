import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import GameShell from '../../components/game/GameShell';
import FeedbackCard from '../../components/game/FeedbackCard';
import { roomDefinitions } from '../../data/rooms';

export default function RoomPage() {
  const { roomId } = useParams();
  const [payload, setPayload] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get(`/api/game/rooms/${roomId}`).then(({ data }) => {
      if (mounted) {
        setPayload(data.room);
        setAttempts([]);
        setLoading(false);
      }
    }).catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [roomId]);

  const puzzle = payload?.puzzles?.[0];
  const definition = payload?.definition ?? roomDefinitions[`room-${payload?.room?.room_number}`] ?? roomDefinitions[`room-${roomId}`];
  const progress = definition?.roomNumber ? Math.min(100, attempts.length * 35) : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/api/game/puzzles/${puzzle.id}/validate`, { roomId, answer });
      setFeedback(data);
      setAttempts((prev) => [...prev, { answer, correct: data.correct }]);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-white p-8">Loading puzzle...</div>;
  }

  return (
    <GameShell
      title={`Room ${definition?.roomNumber ?? payload?.room?.room_number ?? roomId}: ${definition?.title ?? payload?.room?.title ?? 'CyberEscape'}`}
      timer={`${String(9 - Math.floor(progress / 25)).padStart(2, '0')}:45`}
      onPause={() => setFeedback({ correct: false, scoreEarned: 0, attemptsRemaining: 3, lesson: 'Pause is not available in this phase.' })}
      left={
        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Scenario</p>
            <p className="mt-2 text-slate-200">{definition?.scenario ?? payload?.room?.scenario}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Instructions</p>
            <p className="mt-2 text-slate-400">{definition?.instructions ?? payload?.room?.instructions}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Progress</p>
            <div className="mt-3 h-3 rounded-full bg-slate-800">
              <div className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-400">Attempts recorded: {attempts.length}</p>
          </div>
        </div>
      }
      center={
        feedback ? (
          <FeedbackCard
            correct={feedback.correct}
            scoreEarned={feedback.scoreEarned}
            lesson={feedback.lesson}
            attemptsRemaining={feedback.attemptsRemaining}
            onContinue={() => setFeedback(null)}
            onRetry={() => setFeedback(null)}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{definition?.puzzleTitle ?? puzzle?.title}</p>
              <p className="mt-2 text-slate-200">{puzzle?.question}</p>
            </div>
            {definition?.puzzleType === 'multiple_selection' ? (
              <div className="grid gap-2">
                {(definition.options ?? []).map((option) => (
                  <label key={option} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="checkbox" value={option} className="rounded border-slate-600 bg-slate-950" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : definition?.puzzleType === 'multiple_choice' ? (
              <div className="grid gap-2">
                {(definition.options ?? []).map((option) => (
                  <label key={option} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <input type="radio" name="choice" value={option} className="border-slate-600 bg-slate-950" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ) : definition?.puzzleType === 'ordered_steps' ? (
              <div className="grid gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {definition.steps?.map((step, index) => (
                  <div key={step} className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2">
                    <span>{index + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            ) : null}
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-32 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              placeholder={definition?.validationSeed ? `Try: ${definition.validationSeed}` : 'Submit your answer...'}
            />
            <button type="submit" disabled={submitting} className="rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">
              {submitting ? 'Validating...' : 'Submit Answer'}
            </button>
          </form>
        )
      }
      right={
        <div className="space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Clues / Notes</p>
            <div className="mt-3 space-y-3">
              {(definition?.clues ?? []).map((clue) => (
                <div key={clue} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  {clue}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Inventory</p>
            <div className="mt-3 space-y-3">
              {(definition?.inventory ?? []).map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Hint</p>
            <p className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {definition?.hintText}
            </p>
          </div>
        </div>
      }
    />
  );
}

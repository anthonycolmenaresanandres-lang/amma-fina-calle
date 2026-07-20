using System.Collections.Generic;
using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Tests for the pure-function contract (RECONCILED at orchestrator review to match the
    /// implemented runtime — the runtime's design won over this file's original guess):
    ///   ShadowDoors.Runtime.ScenarioDirector.NextEventIndex(events, clock)
    ///
    /// ACTUAL CONTRACT (ScenarioDirector.cs): `events` is the FULL, STATIC list, sorted
    /// ascending by t; the function returns the index of the first event NOT yet due — i.e.
    /// events[0..index) are due at `clock`. The caller (ScenarioDirector.Update) keeps its
    /// own monotone fired-cursor and fires events[firedIndex..index). No list mutation,
    /// no allocation; simultaneous events are covered because they are all &lt;= clock and
    /// land inside the [firedIndex..index) window in one frame.
    /// A null list returns 0 (nothing due, nothing to fire).
    /// </summary>
    public class ScenarioDirectorTests
    {
        private static ScenarioEvent Ev(float t, int door, string action, float speed = 0f)
        {
            return new ScenarioEvent { t = t, door = door, action = action, speed = speed };
        }

        [Test]
        public void NextEventIndex_OrderedFiring_CursorAdvancesWithClock()
        {
            var events = new List<ScenarioEvent>
            {
                Ev(5f, 0, "whisper"),
                Ev(12f, 0, "emerge", 0.35f),
                Ev(20f, 1, "whisper"),
            };

            // Before the first event: nothing due.
            Assert.AreEqual(0, ScenarioDirector.NextEventIndex(events, 0f));
            Assert.AreEqual(0, ScenarioDirector.NextEventIndex(events, 4.99f));

            // At/just past each event time the cursor includes it (t <= clock is due).
            Assert.AreEqual(1, ScenarioDirector.NextEventIndex(events, 5f));
            Assert.AreEqual(1, ScenarioDirector.NextEventIndex(events, 11.99f));
            Assert.AreEqual(2, ScenarioDirector.NextEventIndex(events, 12f));
            Assert.AreEqual(3, ScenarioDirector.NextEventIndex(events, 20f));
            Assert.AreEqual(3, ScenarioDirector.NextEventIndex(events, 175f));
        }

        [Test]
        public void NextEventIndex_SimultaneousEvents_AllIncludedInOneWindow()
        {
            // Two events at the same t=30 (a feint pair: whisper at door A, emerge at door B):
            // both fall inside the due-window at clock=30 in a single call — the caller fires
            // events[fired..2) in one frame. No queue mutation involved.
            var events = new List<ScenarioEvent>
            {
                Ev(30f, 0, "whisper"),
                Ev(30f, 1, "emerge", 0.5f),
                Ev(45f, 2, "whisper"),
            };

            Assert.AreEqual(0, ScenarioDirector.NextEventIndex(events, 29.99f));
            Assert.AreEqual(2, ScenarioDirector.NextEventIndex(events, 30f));
            Assert.AreEqual(3, ScenarioDirector.NextEventIndex(events, 45f));
        }

        [Test]
        public void NextEventIndex_EmptyOrNull_ReturnsZero()
        {
            Assert.AreEqual(0, ScenarioDirector.NextEventIndex(new List<ScenarioEvent>(), 0f));
            Assert.AreEqual(0, ScenarioDirector.NextEventIndex(new List<ScenarioEvent>(), 999f));
            Assert.AreEqual(0, ScenarioDirector.NextEventIndex(null, 10f));
        }

        [Test]
        public void NextEventIndex_ClockPastScenarioDuration_LateEventsStillDue()
        {
            // Past the 180s scenario duration an unfired event is still inside the due
            // window — the director doesn't silently drop late events; GameLoop simply
            // stops asking once the countdown ends.
            var events = new List<ScenarioEvent> { Ev(178f, 3, "whisper") };
            Assert.AreEqual(1, ScenarioDirector.NextEventIndex(events, 250f));
        }

        [Test]
        public void NextEventIndex_IsMonotone_NeverDecreasesAsClockAdvances()
        {
            var events = new List<ScenarioEvent>
            {
                Ev(1f, 0, "whisper"), Ev(2f, 1, "whisper"), Ev(2f, 2, "emerge", 0.4f),
                Ev(10f, 3, "whisper"), Ev(60f, 0, "emerge", 0.6f),
            };

            int previous = 0;
            for (float clock = 0f; clock <= 70f; clock += 0.5f)
            {
                int index = ScenarioDirector.NextEventIndex(events, clock);
                Assert.GreaterOrEqual(index, previous, "cursor must never move backwards");
                previous = index;
            }
            Assert.AreEqual(events.Count, previous);
        }
    }
}

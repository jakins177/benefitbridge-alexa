"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { applyAnswer, choicesFor, createCase, promptFor, STORAGE_KEY } from "@/lib/case";
import { caseStateSchema } from "@/mcp/schemas";
import { normalizeAnswer } from "@/lib/intake";
import { evaluatePrograms } from "@/lib/programs";
import { setReminderStatus, setTaskStatus } from "@/lib/case-actions";
import type { CaseState, ProgramRecommendation } from "@/lib/types";

function statusClass(status: ProgramRecommendation["status"]) {
  return status === "act-now" ? "urgent" : status === "screen" ? "screen" : "monitor";
}

export default function Home() {
  const voiceEpoch = useRef(0);
  const [caseState, setCaseState] = useState<CaseState>(() => createCase());
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [listening, setListening] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    console.info("[BenefitBridge][ui] Application started");
    const restoreFrame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = caseStateSchema.parse(JSON.parse(saved));
          if (parsed.step === "complete") parsed.recommendations = evaluatePrograms(parsed.profile);
          setRemember(true);
          console.info("[BenefitBridge][ui] Resuming saved case", { caseId: parsed.id, step: parsed.step });
          setCaseState(parsed);
        }
      } catch (error) {
        console.error("[BenefitBridge][ui] Failed to restore saved case", error);
        setMessage("Saved demo could not be restored. Start a fresh fictional case.");
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    if (!hydrated || !remember) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(caseState));
      console.info("[BenefitBridge][ui] Case saved", { caseId: caseState.id, step: caseState.step });
    } catch (error) {
      console.error("[BenefitBridge][ui] Failed to save case", error);
      window.alert("Browser storage is unavailable. Your demo is session-only.");
    }
  }, [caseState, hydrated, remember]);

  const progress = useMemo(() => {
    const sequence = ["crisis", "household", "children", "income", "coverage", "energy", "complete"];
    return Math.round((sequence.indexOf(caseState.step) / (sequence.length - 1)) * 100);
  }, [caseState.step]);

  function answer(value: string) {
    voiceEpoch.current += 1; setListening(false);
    try {
      const updated = applyAnswer(caseState, value);
      setCaseState(updated); setMessage(""); setDraft(""); setConfirmation(null);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
  }

  function toggleTask(id: string) {
    console.info("[BenefitBridge][ui] Toggling action task", { caseId: caseState.id, taskId: id });
    setCaseState((current) => setTaskStatus(current, id, !current.completedTasks.includes(id)));
  }

  function resetDemo() {
    voiceEpoch.current += 1; setListening(false);
    console.info("[BenefitBridge][ui] Resetting demo case", { caseId: caseState.id });
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { console.error("[BenefitBridge][ui] Storage clear failed", error); }
    setRemember(false); setMessage(""); setDraft(""); setConfirmation(null);
    setCaseState(createCase());
  }

  function startVoice() {
    type RecognitionConstructor = new () => {
      lang: string;
      interimResults: boolean;
      start: () => void;
      onresult: (event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void;
      onerror: (event: unknown) => void;
      onend: () => void;
    };
    const speechWindow = window as typeof window & {
      webkitSpeechRecognition?: RecognitionConstructor;
      SpeechRecognition?: RecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      console.warn("[BenefitBridge][voice] Speech recognition is not supported in this browser");
      setMessage("Voice input is not supported here. Type an answer or use the buttons.");
      return;
    }
    console.info("[BenefitBridge][voice] Recognition started", { step: caseState.step });
    const epoch = ++voiceEpoch.current;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      if (epoch !== voiceEpoch.current) return;
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setDraft(transcript);
      try { setConfirmation(normalizeAnswer(caseState.step, transcript)); setMessage("Review the transcription before saving."); }
      catch (error) { setConfirmation(null); setMessage(error instanceof Error ? error.message : "Please type your answer."); }
    };
    recognition.onerror = () => { setListening(false); setMessage("Microphone access or speech service unavailable. Type an answer instead."); };
    recognition.onend = () => {
      console.info("[BenefitBridge][voice] Recognition ended");
      setListening(false);
    };
    setListening(true);
    try { recognition.start(); } catch (error) { console.error("[BenefitBridge][voice] Start failed", error); setListening(false); setMessage("Voice could not start. Use text instead."); }
  }

  const completed = caseState.step === "complete";

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">B</div>
          <div><strong>BenefitBridge</strong><span>Life-event recovery agent</span></div>
        </div>
        <div className="caseMeta"><span className="liveDot" /> Fictional demo • no account</div>
      </header>

      <section className="hero">
        <div className="eyebrow">ALEXA+ SIMULATED EXPERIENCE</div>
        <h1>{completed ? "Your recovery plan is ready." : "One conversation. A clear way forward."}</h1>
        <p>{completed
          ? "BenefitBridge found immediate actions, official screening paths, and a seasonal program to recheck."
          : "Tell BenefitBridge what changed. We’ll turn a difficult moment into a prioritized plan you can complete one step at a time."}</p>
        <div className="progressRow"><div className="progressTrack"><span style={{ width: `${progress}%` }} /></div><b>{progress}%</b></div>
      </section>

      <section className="demoNotice" aria-label="Demo privacy and storage">
        <strong>Fictional-data simulator · Kansas only</strong>
        <p>No application is submitted. Do not enter names, Social Security numbers, account numbers, or real personal details. Browser voice may use your browser provider’s speech service; only enable it for fictional answers.</p>
        <label><input type="checkbox" checked={remember} onChange={(event) => { setRemember(event.target.checked); if (!event.target.checked) { try { localStorage.removeItem(STORAGE_KEY); } catch (error) { console.error("[BenefitBridge][ui] Storage clear failed", error); } } }} /> Save this fictional plan on this device</label>
        <button className="textButton" onClick={resetDemo}>Clear demo data</button>
        <p>{remember ? "Browser-only storage enabled. Shared device? Clear your demo when done." : "Session-only: nothing is saved unless you opt in."} Cloud MCP is a separate private operator demo, not connected to this page.</p>
        {message && <p role="alert">{message}</p>}
      </section>
      {!completed ? (
        <section className="conversation panel">
          <div className="assistantLine">
            <div className="orb" aria-hidden="true"><span /></div>
            <div aria-live="polite"><small>BENEFITBRIDGE</small><p>{promptFor(caseState.step)}</p></div>
          </div>
          <div className="choices">
            {choicesFor(caseState.step).map((choice) => (
              <button key={choice.value} onClick={() => answer(choice.value)}>{choice.label}</button>
            ))}
          </div>
          <form className="answerForm" onSubmit={(event) => { event.preventDefault(); try { setConfirmation(normalizeAnswer(caseState.step, draft)); setMessage("Review and confirm your answer."); } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); } }}>
            <label htmlFor="answer">Type a fictional answer</label>
            <input id="answer" maxLength={200} value={draft} onChange={(event) => { setDraft(event.target.value); setConfirmation(null); }} />
            <button type="submit">Review answer</button>
          </form>
          {confirmation && <div className="confirmation" role="status">I understood: <strong>{confirmation}</strong>. <button onClick={() => answer(confirmation)}>Confirm answer</button><button onClick={() => setConfirmation(null)}>Edit</button></div>}
          <button className={`voiceButton ${listening ? "listening" : ""}`} onClick={startVoice} disabled={listening}>
            <span aria-hidden="true">◉</span> {listening ? "Listening…" : "Answer by voice"}
          </button>
          <p className="privacyNote">Voice is optional. Review every transcription before it changes your plan.</p>
        </section>
      ) : (
        <div className="dashboard">
          <section className="summary panel">
            <div><span>Household</span><strong>{caseState.profile.householdSize} people</strong></div>
            <div><span>Expected income</span><strong>${caseState.profile.monthlyGrossIncome?.toLocaleString()}/mo</strong></div>
            <div><span>Immediate actions</span><strong>{caseState.recommendations.filter((item) => item.status !== "monitor").length}</strong></div>
            <div><span>Progress</span><strong>{caseState.completedTasks.length}/{caseState.recommendations.length} started</strong></div>
          </section>

          <section className="planSection">
            <div className="sectionHeading"><div><span>PRIORITIZED RECOVERY PLAN</span><h2>What to do next</h2></div><button className="textButton" onClick={resetDemo}>Start over</button></div>
            <div className="programGrid">
              {caseState.recommendations.map((program) => {
                const done = caseState.completedTasks.includes(program.id);
                return (
                  <article className={`programCard ${done ? "done" : ""}`} key={program.id}>
                    <div className="programTop"><span className={`status ${statusClass(program.status)}`}>{program.statusLabel}</span><span className="priority">0{program.priority}</span></div>
                    <h3>{program.name}</h3>
                    <p className="programDescription">{program.description}</p>
                    <small className="reasonLabel">WHY THIS IS ON YOUR PLAN</small>
                    <p>{program.reason}</p>
                    <button className="detailsButton" aria-expanded={expanded === program.id} onClick={() => setExpanded(expanded === program.id ? null : program.id)}>
                      {expanded === program.id ? "Hide details" : "View next step"}
                    </button>
                    {expanded === program.id && <div className="details">
                      <b>Next step</b><p>{program.nextStep}</p>
                      <b>Likely documents</b><ul>{program.documents.map((doc) => <li key={doc}>{doc}</li>)}</ul>
                      <a href={program.officialUrl} target="_blank" rel="noreferrer">Open official source ↗</a>
                      <small>Information checked {program.verifiedOn}</small>
                    </div>}
                    <label className="taskCheck"><input type="checkbox" checked={done} onChange={() => toggleTask(program.id)} /><span>{done ? "Marked as started" : "Mark action started"}</span></label>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="reminder panel">
            <div><span className="bell" aria-hidden="true">⌁</span><div><h3>Recheck LIEAP in 30 days</h3><p>As checked October 13, Kansas says the 2026 window ended. This demo saves a date to check the official page yourself—not automatic monitoring, email, or an Alexa notification.</p></div></div>
            <button className={caseState.reminderEnabled ? "enabled" : ""} onClick={() => setCaseState((current) => ({ ...setReminderStatus(current, !current.reminderEnabled), reminderScheduledAt: current.reminderEnabled ? undefined : new Date(Date.now() + 30 * 86400000).toISOString() }))}>
              {caseState.reminderEnabled ? "Cancel saved follow-up" : "Save 30-day follow-up"}
            </button>
            {caseState.reminderEnabled && <p role="status">Recheck date: {caseState.reminderScheduledAt?.slice(0, 10)} · {remember ? "saved on this device" : "session only"}</p>}
          </section>

          <p className="disclaimer">BenefitBridge provides preliminary guidance, not an official eligibility decision or legal advice. Government agencies make final determinations. Always verify information on the linked official source.</p>
        </div>
      )}
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { applyAnswer, choicesFor, createCase, promptFor, STORAGE_KEY } from "@/lib/case";
import type { CaseState, ProgramRecommendation } from "@/lib/types";

function statusClass(status: ProgramRecommendation["status"]) {
  return status === "act-now" ? "urgent" : status === "screen" ? "screen" : "monitor";
}

export default function Home() {
  const [caseState, setCaseState] = useState<CaseState>(() => createCase());
  const [hydrated, setHydrated] = useState(false);
  const [listening, setListening] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    console.info("[BenefitBridge][ui] Application started");
    const restoreFrame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as CaseState;
          console.info("[BenefitBridge][ui] Resuming saved case", { caseId: parsed.id, step: parsed.step });
          setCaseState(parsed);
        }
      } catch (error) {
        console.error("[BenefitBridge][ui] Failed to restore saved case", error);
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(restoreFrame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(caseState));
      console.info("[BenefitBridge][ui] Case saved", { caseId: caseState.id, step: caseState.step });
    } catch (error) {
      console.error("[BenefitBridge][ui] Failed to save case", error);
    }
  }, [caseState, hydrated]);

  const progress = useMemo(() => {
    const sequence = ["crisis", "household", "children", "income", "coverage", "energy", "complete"];
    return Math.round((sequence.indexOf(caseState.step) / (sequence.length - 1)) * 100);
  }, [caseState.step]);

  function answer(value: string) {
    setCaseState((current) => applyAnswer(current, value));
  }

  function toggleTask(id: string) {
    console.info("[BenefitBridge][ui] Toggling action task", { caseId: caseState.id, taskId: id });
    setCaseState((current) => ({
      ...current,
      completedTasks: current.completedTasks.includes(id)
        ? current.completedTasks.filter((taskId) => taskId !== id)
        : [...current.completedTasks, id],
      updatedAt: new Date().toISOString()
    }));
  }

  function resetDemo() {
    console.info("[BenefitBridge][ui] Resetting demo case", { caseId: caseState.id });
    window.localStorage.removeItem(STORAGE_KEY);
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
      window.alert("Voice input is not supported in this browser. Use the response buttons to continue.");
      return;
    }
    console.info("[BenefitBridge][voice] Recognition started", { step: caseState.step });
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      console.info("[BenefitBridge][voice] Transcript received", { transcript });
      if (caseState.step === "household" || caseState.step === "income") answer(transcript);
      else answer(/yes|lost|don.t|no coverage/i.test(transcript) ? "yes" : "no");
    };
    recognition.onerror = (event) => console.error("[BenefitBridge][voice] Recognition failed", event);
    recognition.onend = () => {
      console.info("[BenefitBridge][voice] Recognition ended");
      setListening(false);
    };
    setListening(true);
    recognition.start();
  }

  const completed = caseState.step === "complete";

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="brandMark" aria-hidden="true">B</div>
          <div><strong>BenefitBridge</strong><span>Life-event recovery agent</span></div>
        </div>
        <div className="caseMeta"><span className="liveDot" /> Case {caseState.id}</div>
      </header>

      <section className="hero">
        <div className="eyebrow">ALEXA+ SIMULATED EXPERIENCE</div>
        <h1>{completed ? "Your recovery plan is ready." : "One conversation. A clear way forward."}</h1>
        <p>{completed
          ? "BenefitBridge found immediate actions, official screening paths, and one time-sensitive program to monitor."
          : "Tell BenefitBridge what changed. We’ll turn a difficult moment into a prioritized plan you can complete one step at a time."}</p>
        <div className="progressRow"><div className="progressTrack"><span style={{ width: `${progress}%` }} /></div><b>{progress}%</b></div>
      </section>

      {!completed ? (
        <section className="conversation panel">
          <div className="assistantLine">
            <div className="orb" aria-hidden="true"><span /></div>
            <div><small>BENEFITBRIDGE</small><p>{promptFor(caseState.step)}</p></div>
          </div>
          <div className="choices">
            {choicesFor(caseState.step).map((choice) => (
              <button key={choice.value} onClick={() => answer(choice.value)}>{choice.label}</button>
            ))}
          </div>
          <button className={`voiceButton ${listening ? "listening" : ""}`} onClick={startVoice} disabled={listening}>
            <span aria-hidden="true">◉</span> {listening ? "Listening…" : "Answer by voice"}
          </button>
          <p className="privacyNote">Demo mode uses sample information and stores it only in this browser.</p>
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
                    <p>{program.reason}</p>
                    <button className="detailsButton" onClick={() => setExpanded(expanded === program.id ? null : program.id)}>
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
            <div><span className="bell" aria-hidden="true">⌁</span><div><h3>Monitor the next LIEAP window</h3><p>Kansas says the 2026 application period has ended. Save this watch so BenefitBridge can flag the next published window.</p></div></div>
            <button className={caseState.reminderEnabled ? "enabled" : ""} onClick={() => setCaseState((current) => ({ ...current, reminderEnabled: !current.reminderEnabled, updatedAt: new Date().toISOString() }))}>
              {caseState.reminderEnabled ? "Reminder saved ✓" : "Notify me"}
            </button>
          </section>

          <p className="disclaimer">BenefitBridge provides preliminary guidance, not an official eligibility decision or legal advice. Government agencies make final determinations. Always verify information on the linked official source.</p>
        </div>
      )}
    </main>
  );
}

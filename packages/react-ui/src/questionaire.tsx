import React from "react";
import { Textbox } from "./textbox";
import { Select } from "./select";

interface QuestionOption {
  label: string;
  value: string;
}

interface VisibleCondition {
  id: string;
  value?: string | boolean | number;
  answered?: boolean;
}

type HintLink = { type: "link"; text: string; href: string; target?: string };
type HintContent = string | HintLink;
type LabelList = { heading: string; list: (string | HintLink)[] };

interface QuestionConfig {
  id: string;
  label: string | string[] | LabelList;
  hint?: string | string[] | HintContent[];
  type?: "single" | "multi" | "text" | "select";
  options?: QuestionOption[];
  required?: boolean;
  visibleWhen?: VisibleCondition[];
  maxChars?: number;
  minChars?: number;
  errorMessage?: string;
  placeholder?: string;
}

interface QuestionaireProps {
  questions: QuestionConfig[];
  answers: Record<string, any>;
  onAnswerChange: (id: string, value: any) => void;
}

function isQuestionVisible(q: QuestionConfig, answers: Record<string, any>): boolean {
  if (!q.visibleWhen || q.visibleWhen.length === 0) return true;
  return q.visibleWhen.every(cond => {
    const answer = answers[cond.id];
    
    // If checking for "answered" property
    if (cond.answered !== undefined) {
      const hasAnswer = answer !== undefined && answer !== null && answer !== '';
      return cond.answered === hasAnswer;
    }
    
    // Otherwise check for specific value match
    return answer === cond.value;
  });
}

export function Questionaire({ questions, answers, onAnswerChange }: QuestionaireProps) {
  return (
    <div className="questionaire">
      {questions.map((q, idx) => {
        if (!isQuestionVisible(q, answers)) {
          return null;
        }
        const value = answers[q.id];
        const type: "single" | "multi" | "text" | "select" = q.type || (q.options ? (q.options.length > 0 ? "single" : "text") : "text");
        if (type === "select") {
          // Only pass allowed types to Select.label
          let selectLabel: string | string[] | HintContent[] = "";
          if (typeof q.label === "string" || Array.isArray(q.label)) {
            selectLabel = q.label;
          } else if (q.label && typeof (q.label as any).heading === "string") {
            selectLabel = (q.label as any).heading;
          } else {
            selectLabel = "";
          }
          return (
            <div key={q.id} className="question mb-4">
              <Select
                id={q.id}
                label={selectLabel}
                hint={q.hint}
                required={q.required}
                options={q.options || []}
                errorMessage={q.errorMessage}
                value={value || ""}
                onChange={(val: string) => onAnswerChange(q.id, val)}
              />
            </div>
          );
        }
        return (
          <div key={q.id} className="question mb-4">
            {type === "text" ? (
              <Textbox
                id={q.id}
                label={typeof q.label === "string" || Array.isArray(q.label) ? q.label : (q.label && typeof (q.label as any).heading === "string" ? (q.label as any).heading : "")}
                required={q.required}
                maxChars={q.maxChars}
                minChars={q.minChars}
                errorMessage={q.errorMessage}
                placeholder={q.placeholder}
                value={value || ""}
                onChange={(val) => onAnswerChange(q.id, val)}
              />
            ) : (
              <>
                {renderTextOrList(q.label, "mb-2", q.id)}
                {type === "single" ? (
                  <div className="btn-group d-flex" role="group" aria-label={q.id}>
                    {q.options?.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`btn btn-${value === opt.value ? "primary" : "light"} me-2 flex-grow-1`}
                        onClick={() => {
                          // Set current answer
                          onAnswerChange(q.id, opt.value);
                          // Reset subsequent questions in this questionnaire
                          for (let i = idx + 1; i < questions.length; i++) {
                            const nextQ = questions[i];
                            if (nextQ && nextQ.id) {
                              onAnswerChange(nextQ.id, undefined);
                            }
                          }
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div>
                    {q.options?.map((opt) => {
                      const selected: string[] = Array.isArray(value) ? value : [];
                      const checked = selected.includes(opt.value);
                      return (
                        <div className="form-check" key={opt.value}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`${q.id}-${opt.value}`}
                            checked={checked}
                            onChange={(e) => {
                              const next = new Set(selected);
                              if (e.target.checked) {
                                next.add(opt.value);
                              } else {
                                next.delete(opt.value);
                              }
                              // Set current multi-select answer
                              onAnswerChange(q.id, Array.from(next));
                              // Reset subsequent questions in this questionnaire
                              for (let i = idx + 1; i < questions.length; i++) {
                                const nextQ = questions[i];
                                if (nextQ && nextQ.id) {
                                  onAnswerChange(nextQ.id, undefined);
                                }
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor={`${q.id}-${opt.value}`}>
                            {opt.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

const renderTextOrList = (
  content: string | string[] | HintContent[] | { heading: string; list: (string | HintLink)[] } | undefined,
  className?: string,
  id?: string,
  showExampleLabel: boolean = true
) => {
  if (!content) return null;
  // Handle new label object with heading and list
  if (typeof content === "object" && "heading" in content && "list" in content) {
    // Heading can be string or array of string/link objects
    const heading = Array.isArray(content.heading) ? content.heading : [content.heading];
    return (
      <div className={className} id={id}>
        <span style={{ fontWeight: 600 }}>
          {heading.map((h, i) =>
            typeof h === "string"
              ? h
              : <a
                  key={i}
                  href={h.href}
                  target={h.target || "_blank"}
                  rel="noopener noreferrer"
                  className="qld-hint-link"
                >
                  {h.text}
                </a>
          )}
        </span>
        {content.intro && (
          <div style={{ marginTop: 4, marginBottom: 4 }}>{content.intro}</div>
        )}
        <ul style={{ marginTop: 0, marginBottom: 0, paddingLeft: 20 }}>
          {content.list.map((item, i) =>
            typeof item === "string" ? (
              <li key={i}>{item}</li>
            ) : (
              <li key={i}>
                <a
                  href={item.href}
                  target={item.target || "_blank"}
                  rel="noopener noreferrer"
                  className="qld-hint-link"
                >
                  {item.text}
                </a>
              </li>
            )
          )}
        </ul>
      </div>
    );
  }
  // ...existing code for string, string[], HintContent[]
};
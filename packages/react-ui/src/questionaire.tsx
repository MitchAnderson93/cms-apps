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
type LabelList = { heading: string; list: (string | HintLink)[]; intro?: string };

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
    // Support array of allowed values
    if (Array.isArray(cond.value)) {
      return cond.value.includes(answer);
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
        // Render HTML type question as a block of HTML (using label and/or hint)
        if (q.type === "html") {
          return (
            <div key={q.id} className="question mb-4">
              {q.label && (
                <div className="qld-text-input-label" dangerouslySetInnerHTML={{ __html: typeof q.label === "string" ? q.label : (q.label.heading || "") }} />
              )}
              {q.hint && (
                <div className="qld-hint-text" dangerouslySetInnerHTML={{ __html: q.hint }} />
              )}
            </div>
          );
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
                label={q.label}
                hint={q.hint}
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
                {renderTextOrList(q.label, "mb-2", q.id, true, q.required)}
                {/* Render checkboxes for multi, radios for single with >2 options, else use button group for binary single */}
                {type === "multi" ? (
                  <div>
                    {q.options?.map((opt) => {
                      const selected: string[] = Array.isArray(value) ? value : [];
                      const checked = selected.includes(opt.value);
                      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        const next = new Set(selected);
                        if (e.target.checked) {
                          next.add(opt.value);
                        } else {
                          next.delete(opt.value);
                        }
                        onAnswerChange(q.id, Array.from(next));
                        for (let i = idx + 1; i < questions.length; i++) {
                          const nextQ = questions[i];
                          if (nextQ && nextQ.id) {
                            onAnswerChange(nextQ.id, undefined);
                          }
                        }
                      };
                      return (
                        <div className="form-check" key={opt.value}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`${q.id}-${opt.value}`}
                            checked={checked}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor={`${q.id}-${opt.value}`}>
                            {opt.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : type === "single" && q.options && q.options.length > 2 ? (
                  <div>
                    {q.options?.map((opt) => {
                      const checked = value === opt.value;
                      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        if (e.target.checked) {
                          onAnswerChange(q.id, opt.value);
                          for (let i = idx + 1; i < questions.length; i++) {
                            const nextQ = questions[i];
                            if (nextQ && nextQ.id) {
                              onAnswerChange(nextQ.id, undefined);
                            }
                          }
                        }
                      };
                      return (
                        <div className="form-check" key={opt.value}>
                          <input
                            className="form-check-input"
                            type="radio"
                            name={q.id}
                            id={`${q.id}-${opt.value}`}
                            checked={checked}
                            onChange={handleChange}
                          />
                          <label className="form-check-label" htmlFor={`${q.id}-${opt.value}`}>
                            {opt.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="d-flex gap-2" role="group" aria-label={q.id}>
                    {q.options?.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`btn btn-${value === opt.value ? "primary" : "light"} me-2 flex-grow-1`}
                        onClick={() => {
                          onAnswerChange(q.id, opt.value);
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
  content: string | string[] | HintContent[] | { heading: string; list: (string | HintLink)[]; intro?: string } | undefined,
  className?: string,
  id?: string,
  showExampleLabel: boolean = true,
  required?: boolean
) => {
  if (!content) return null;
  // Handle new label object with heading and list
  if (typeof content === "object" && "heading" in content && "list" in content) {
    // Heading can be string or array of string/link objects
    const heading = Array.isArray(content.heading) ? content.heading : [content.heading];
    return (
      <div className={className} id={id}>
        <div className={required ? "qld-text-input-label field-required" : "qld-text-input-label"}>
          {heading.map((h, i) => {
            if (i === 0 && required) {
              if (typeof h === "string") {
                return " " + h;
              } else {
                return <span key={i}> <a
                  href={h.href}
                  target={h.target || "_blank"}
                  rel="noopener noreferrer"
                  className="qld-hint-link"
                >
                  {h.text}
                </a></span>;
              }
            }
            return typeof h === "string"
              ? h
              : <a
                  key={i}
                  href={h.href}
                  target={h.target || "_blank"}
                  rel="noopener noreferrer"
                  className="qld-hint-link"
                >
                  {h.text}
                </a>;
          })}
        </div>
        {content.intro && (
          <span className="qld-hint-text">{content.intro}</span>
        )}
        <span className="qld-hint-text">
          <ul className="pl-20">
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
        </span>
      </div>
    );
  }
};
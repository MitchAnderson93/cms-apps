import React from "react";

interface QuestionOption {
  label: string;
  value: string;
}

interface VisibleCondition {
  id: string;
  value: string | boolean | number;
}

interface QuestionConfig {
  id: string;
  promptHtml: string;
  type?: "single" | "multi";
  options: QuestionOption[];
  required?: boolean;
  visibleWhen?: VisibleCondition[];
}

interface QuestionaireProps {
  questions: QuestionConfig[];
  answers: Record<string, any>;
  onAnswerChange: (id: string, value: any) => void;
}

function isQuestionVisible(q: QuestionConfig, answers: Record<string, any>): boolean {
  if (!q.visibleWhen || q.visibleWhen.length === 0) return true;
  return q.visibleWhen.every(cond => answers[cond.id] === cond.value);
}

export function Questionaire({ questions, answers, onAnswerChange }: QuestionaireProps) {
  return (
    <div className="questionaire">
      {questions.map((q, idx) => {
        if (!isQuestionVisible(q, answers)) {
          return null;
        }
        const value = answers[q.id];
        const type = q.type || "single";
        return (
          <div key={q.id} className="question mb-4">
            <div dangerouslySetInnerHTML={{ __html: q.promptHtml }} />
            {type === "single" ? (
              <div className="btn-group d-flex" role="group" aria-label={q.id}>
                {q.options.map((opt) => (
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
                {q.options.map((opt) => {
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
          </div>
        );
      })}
    </div>
  );
}

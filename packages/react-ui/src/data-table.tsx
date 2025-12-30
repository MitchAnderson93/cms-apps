import React, { useState } from "react";
import { Textbox } from "./textbox";

interface DataTableRow {
  value: string;
}

interface DataTableProps {
  id: string;
  label: string;
  addLabel?: string; // Label for 'Add row' button
  deleteLabel?: string; // Label for 'Delete' button
  minRows?: number;
  maxRows?: number;
  required?: boolean;
  onChange?: (rows: string[]) => void;
  value?: string[];
  placeholder?: string;
}

export function DataTable({
  id,
  label,
  addLabel = "Add row",
  deleteLabel = "Delete",
  minRows = 1,
  maxRows,
  required = false,
  onChange,
  value = [""],
  placeholder = ""
}: DataTableProps) {
  const [rows, setRows] = useState<string[]>(value.length > 0 ? value : [""]);
  const [touched, setTouched] = useState(false);

  const handleRowChange = (idx: number, val: string) => {
    const newRows = [...rows];
    newRows[idx] = val;
    setRows(newRows);
    // Only pass non-last rows to validation (last row is being actively typed)
    const committedRows = newRows.slice(0, -1);
    if (onChange) onChange(committedRows);
    if (!touched) setTouched(true);
  };

  const handleAddRow = () => {
    if (!maxRows || rows.length < maxRows) {
      const newRows = [...rows, ""];
      setRows(newRows);
      // When adding a row, the previous last row is now committed
      const committedRows = newRows.slice(0, -1);
      if (onChange) onChange(committedRows);
    }
  };

  const handleDeleteRow = (idx: number) => {
    if (rows.length > minRows) {
      const newRows = rows.filter((_, i) => i !== idx);
      setRows(newRows);
      // When deleting, recalculate committed rows
      const committedRows = newRows.slice(0, -1);
      if (onChange) onChange(committedRows);
    }
  };

  const isValid = () => {
    const filledRows = rows.filter(r => r.trim().length > 0);
    return filledRows.length >= minRows && (!required || filledRows.length > 0);
  };

  return (
    <div className="data-table-component">
      <div className={`data-table-label qld-text-input-label${required ? " field-required" : ""}`}>{label}</div>
      <div className="table-responsive qld-table">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Ingredient</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const isLastRow = idx === rows.length - 1;
              const canAddRow = row.trim().length > 0 && (!maxRows || rows.length < maxRows);
              return (
                <tr key={idx}>
                  <td>
                    <Textbox
                      id={`${id}-row-${idx}`}
                      label={``}
                      value={row}
                      onChange={val => handleRowChange(idx, val)}
                      required={required}
                      placeholder={placeholder}
                      disabled={!isLastRow}
                    />
                  </td>
                  <td>
                    {isLastRow ? (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleAddRow}
                        disabled={!canAddRow}
                      >
                        <span className="qld-icon qld-icon-lg qld-icon-plus leading" aria-hidden="true"></span>
                        <span className="btn-label-default">{addLabel}</span>
                      </button>
                    ) : (
                      <button type="button" className="btn btn-secondary" onClick={() => handleDeleteRow(idx)}>
                        <span className="qld-icon qld-icon-lg qld-icon-close leading" aria-hidden="true"></span>
                        <span className="btn-label-default">{deleteLabel}</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {touched && !isValid() && (
        <div className="mt-2 invalid-feedback d-block"> At least {minRows} row(s) must be filled.</div>
      )}
    </div>
  );
}

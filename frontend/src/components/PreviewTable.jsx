"use client";

import { THEME } from "@/constants/theme";

// Shared data table component — extracted here rather than kept inline
// in PreviewTable/ResultsTable because both need identical table structure.
// All color decisions come from THEME tokens; structural classes (padding,
// sizing, overflow) stay inline since they are layout decisions, not brand.
export function DataTable({ columns, rows, emptyMessage, getColumnLabel }) {
  if (rows.length === 0) {
    return (
      <p className={`py-6 text-center text-sm ${THEME.textMuted}`}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={`overflow-hidden rounded-xl border ${THEME.border}`}>
      <div className="max-h-96 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className={`sticky top-0 ${THEME.tableHeaderBg}`}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={`whitespace-nowrap border-b px-4 py-3 text-left font-medium ${THEME.borderDivider} ${THEME.textLabel}`}
                >
                  {getColumnLabel ? getColumnLabel(col) : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.email || row.id || i}
                className={`border-b ${THEME.borderSubtle}`}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className={`whitespace-nowrap px-4 py-2 ${THEME.textBody}`}
                  >
                    {row[col] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// PreviewTable — shows raw uploaded CSV rows exactly as they appear in
// the file, before any AI mapping. No column label translation here since
// these are the user's own column names, not CRM field names.
export default function PreviewTable({ columns, rows }) {
  return <DataTable columns={columns} rows={rows} />;
}
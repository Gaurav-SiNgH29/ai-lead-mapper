'use client';

import { CRM_FIELDS } from '@/constants/crmSchema';
import { MESSAGES } from '@/constants/messages';

function DataTable({ columns, rows, emptyMessage }) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="max-h-96 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left font-medium text-slate-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-slate-100">
                {columns.map((col) => (
                  <td
                    key={col}
                    className="whitespace-nowrap px-4 py-2 text-slate-700"
                  >
                    {row[col]}
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

export default function ResultsTable({ imported, skipped }) {
  const skippedRows = skipped.map((item) => ({
    ...item.row,
    __reason: item.reason,
  }));
  const skippedColumns =
    skippedRows.length > 0
      ? Object.keys(skippedRows[0]).filter((key) => key !== '__reason')
      : [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {MESSAGES.importedLabel}
          </p>
          <p className="mt-1 text-2xl font-semibold text-teal-600">
            {imported.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {MESSAGES.skippedLabel}
          </p>
          <p className="mt-1 text-2xl font-semibold text-orange-500">
            {skipped.length}
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-700">
          {MESSAGES.importedLabel} records
        </h3>
        <DataTable
          columns={CRM_FIELDS}
          rows={imported}
          emptyMessage="No records were imported."
        />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-slate-700">
          {MESSAGES.skippedLabel} records
        </h3>
        <DataTable
          columns={[...skippedColumns, '__reason']}
          rows={skippedRows}
          emptyMessage="No records were skipped."
        />
      </div>
    </div>
  );
}

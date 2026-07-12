"use client";

import { CRM_FIELDS, CRM_FIELD_LABELS } from "@/constants/crmSchema";
import { MESSAGES } from "@/constants/messages";
import { THEME } from "@/constants/theme";
import { DataTable } from "@/components/PreviewTable";

// Maps a raw column key to a human-readable header label.
// CRM fields use CRM_FIELD_LABELS; internal keys like __reason
// use MESSAGES; anything else falls back to the raw key name.
function getColumnLabel(col) {
  if (col === "__reason") return MESSAGES.reasonColumnLabel;
  return CRM_FIELD_LABELS[col] || col;
}

export default function ResultsTable({ imported, skipped }) {
  const skippedRows = skipped.map((item) => ({
    ...item.row,
    __reason: item.reason,
  }));

  // Derive skipped columns from the union of all skipped rows so a
  // column that only appears on SOME rows (e.g. "name" on duplicate
  // rows but not on "no contact" rows) still gets its own column.
  const skippedColumns = Array.from(
    skippedRows.reduce((cols, row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "__reason") cols.add(key);
      });
      return cols;
    }, new Set())
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <div className={`rounded-xl border p-4 ${THEME.border} ${THEME.inputBg}`}>
          <p className={`text-xs uppercase tracking-wide ${THEME.textSecondary}`}>
            {MESSAGES.importedLabel}
          </p>
          <p className={`mt-1 text-2xl font-semibold ${THEME.accentText}`}>
            {imported.length}
          </p>
        </div>
        <div className={`rounded-xl border p-4 ${THEME.border} ${THEME.inputBg}`}>
          <p className={`text-xs uppercase tracking-wide ${THEME.textSecondary}`}>
            {MESSAGES.skippedLabel}
          </p>
          <p className={`mt-1 text-2xl font-semibold ${THEME.primaryText}`}>
            {skipped.length}
          </p>
        </div>
      </div>

      <div>
        <h3 className={`mb-3 text-sm font-medium ${THEME.textBody}`}>
          {MESSAGES.importedLabel} records
        </h3>
        <DataTable
          columns={CRM_FIELDS}
          rows={imported}
          emptyMessage={MESSAGES.importedEmptyState}
          getColumnLabel={getColumnLabel}
        />
      </div>

      <div>
        <h3 className={`mb-3 text-sm font-medium ${THEME.textBody}`}>
          {MESSAGES.skippedLabel} records
        </h3>
        <DataTable
          columns={[...skippedColumns, "__reason"]}
          rows={skippedRows}
          emptyMessage={MESSAGES.skippedEmptyState}
          getColumnLabel={getColumnLabel}
        />
      </div>
    </div>
  );
}
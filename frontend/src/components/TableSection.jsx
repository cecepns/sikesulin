export function Toolbar({ placeholder, search, onSearchChange, onRefresh }) {
  return (
    <div className="mb-3 flex flex-col gap-2 text-[11px] md:mb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 shadow-inner shadow-slate-100 outline-none transition focus:border-pkk-primary focus:bg-white focus:shadow-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm hover:border-pkk-primary/60 hover:text-pkk-primary-dark"
        >
          Muat Ulang
        </button>
      </div>
    </div>
  );
}

export function DataTable({ loading, error, emptyMessage, columns, rows }) {
  if (loading) {
    return (
      <div className="flex min-h-[180px] items-center justify-center text-xs text-slate-500">
        Memuat data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 px-4 text-xs text-red-700">
        {error}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 text-center text-xs text-slate-500">
        <div className="max-w-sm px-4">
          <p className="font-semibold text-slate-700">{emptyMessage}</p>
          <p className="mt-1">
            Tambahkan data melalui backend atau fitur input yang akan dibuat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 text-[11px]">
      <table className="min-w-full border-collapse bg-white">
        <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-t border-slate-100 hover:bg-teal-50/40"
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 text-slate-700">
                  {cell || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


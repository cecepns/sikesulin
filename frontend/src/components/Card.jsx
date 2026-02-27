export function Card({ title, description, children }) {
  return (
    <section className="mb-4 rounded-2xl border border-teal-100 bg-white/90 p-4 shadow-sm shadow-teal-50 md:mb-6 md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[11px] text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}


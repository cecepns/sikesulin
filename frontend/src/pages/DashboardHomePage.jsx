import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { dashboardApi } from '../utils/api';

function OverviewPill({ label, value, loading }) {
  return (
    <div className="rounded-xl border border-teal-100 bg-white px-3 py-3 shadow-sm shadow-teal-50">
      <p className="text-[10px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-pkk-primary-dark">
        {loading ? '...' : value}
      </p>
    </div>
  );
}

function ActivityRow({ jenis, nomor, perihal, tanggal, status }) {
  return (
    <tr className="border-t border-slate-100 hover:bg-teal-50/40">
      <td className="px-3 py-2 font-medium text-slate-700">{jenis}</td>
      <td className="px-3 py-2 text-slate-700">{nomor}</td>
      <td className="px-3 py-2 text-slate-600">{perihal}</td>
      <td className="px-3 py-2 text-slate-600">{tanggal}</td>
      <td className="px-3 py-2">
        <span className="inline-flex rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-pkk-primary-dark">
          {status}
        </span>
      </td>
    </tr>
  );
}

function DashboardHomePage() {
  const [overview, setOverview] = useState({
    suratMasukHariIni: 0,
    suratKeluarHariIni: 0,
    disposisiProses: 0,
    disposisiSelesai: 0,
  });
  const [aktivitas, setAktivitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await dashboardApi.overview();
        if (!cancelled && data) {
          setOverview({
            suratMasukHariIni: data.overview?.suratMasukHariIni ?? 0,
            suratKeluarHariIni: data.overview?.suratKeluarHariIni ?? 0,
            disposisiProses: data.overview?.disposisiProses ?? 0,
            disposisiSelesai: data.overview?.disposisiSelesai ?? 0,
          });
          setAktivitas(Array.isArray(data.aktivitasTerbaru) ? data.aktivitasTerbaru : []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(err.message || 'Gagal memuat ringkasan dashboard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
      <Card
        title="Ringkasan Surat"
        description="Gambaran singkat aktivitas surat masuk, surat keluar, dan disposisi."
      >
        <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <OverviewPill
            label="Surat Masuk Hari Ini"
            value={overview.suratMasukHariIni}
            loading={loading}
          />
          <OverviewPill
            label="Surat Keluar Hari Ini"
            value={overview.suratKeluarHariIni}
            loading={loading}
          />
          <OverviewPill
            label="Disposisi Proses"
            value={overview.disposisiProses}
            loading={loading}
          />
          <OverviewPill
            label="Disposisi Selesai"
            value={overview.disposisiSelesai}
            loading={loading}
          />
        </div>
      </Card>

      <Card
        title="Aktivitas Terbaru"
        description="Beberapa surat terakhir yang baru diinput."
      >
        {error ? (
          <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-red-200 bg-red-50/60 px-4 text-xs text-red-700">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100 text-[11px]">
            <table className="min-w-full border-collapse bg-white">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Jenis</th>
                  <th className="px-3 py-2 text-left">Nomor</th>
                  <th className="px-3 py-2 text-left">Perihal</th>
                  <th className="px-3 py-2 text-left">Tanggal</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && !aktivitas.length ? (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-xs text-slate-500"
                      colSpan={5}
                    >
                      Memuat aktivitas terbaru...
                    </td>
                  </tr>
                ) : aktivitas.length ? (
                  aktivitas.map((item, idx) => (
                    <ActivityRow
                      key={idx}
                      jenis={item.jenis}
                      nomor={item.nomor_surat}
                      perihal={item.perihal}
                      tanggal={item.tanggal}
                      status={item.status}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-3 py-4 text-center text-xs text-slate-500"
                      colSpan={5}
                    >
                      Belum ada aktivitas terbaru.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default DashboardHomePage;


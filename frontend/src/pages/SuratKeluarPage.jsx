import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { DataTable, Toolbar } from '../components/TableSection';
import { suratKeluarApi } from '../utils/api';

function SuratKeluarPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
    totalPages: 1,
  });
  const [form, setForm] = useState({
    nomor_surat: '',
    tanggal_surat: '',
    tujuan: '',
    perihal: '',
    keterangan: '',
  });

  const loadData = async (pageToLoad = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await suratKeluarApi.list({ page: pageToLoad, perPage: 10 });
      const data = res?.data ?? res;
      setItems(Array.isArray(data) ? data : []);
      if (res?.pagination) {
        setPagination(res.pagination);
        setPage(res.pagination.page);
      } else {
        setPagination((prev) => ({
          ...prev,
          page: pageToLoad,
          total: Array.isArray(data) ? data.length : 0,
          totalPages: 1,
        }));
        setPage(pageToLoad);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal memuat surat keluar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (editingId) {
        await suratKeluarApi.update(editingId, {
          ...form,
          status: selectedItem?.status || 'draft',
        });
      } else {
        await suratKeluarApi.create({
          ...form,
          status: 'draft',
        });
      }
      setForm({
        nomor_surat: '',
        tanggal_surat: '',
        tujuan: '',
        perihal: '',
        keterangan: '',
      });
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Gagal menyimpan surat keluar.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus surat keluar ini?')) return;
    try {
      await suratKeluarApi.remove(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Gagal menghapus surat keluar.');
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setSelectedItem(item);
    setForm({
      nomor_surat: item.nomor_surat || '',
      tanggal_surat: item.tanggal_surat || '',
      tujuan: item.tujuan || '',
      perihal: item.perihal || '',
      keterangan: item.keterangan || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewClick = (item) => {
    setSelectedItem(item);
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.nomor_surat?.toLowerCase().includes(q) ||
      item.perihal?.toLowerCase().includes(q) ||
      item.tujuan?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <Card
        title={editingId ? 'Edit Surat Keluar' : 'Tambah Surat Keluar'}
        description={
          editingId
            ? 'Perbarui data surat keluar yang sudah tersimpan.'
            : 'Input surat keluar baru dari TP PKK Kelurahan Sungai Ulin.'
        }
      >
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 text-xs md:grid-cols-2"
        >
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Nomor Surat
            </label>
            <input
              name="nomor_surat"
              value={form.nomor_surat}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Tanggal Surat
            </label>
            <input
              type="date"
              name="tanggal_surat"
              value={form.tanggal_surat}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Tujuan
            </label>
            <input
              name="tujuan"
              value={form.tujuan}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Perihal
            </label>
            <input
              name="perihal"
              value={form.perihal}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="block font-semibold text-slate-700">
              Keterangan (opsional)
            </label>
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
          </div>
          {formError && (
            <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {formError}
            </p>
          )}
          <div className="md:col-span-2 flex justify-end">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setSelectedItem(null);
                  setForm({
                    nomor_surat: '',
                    tanggal_surat: '',
                    tujuan: '',
                    perihal: '',
                    keterangan: '',
                  });
                }}
                className="mr-2 rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={formLoading}
              className="rounded-lg bg-pkk-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-pkk-primary-dark disabled:opacity-70"
            >
              {formLoading
                ? 'Menyimpan...'
                : editingId
                  ? 'Update Surat Keluar'
                  : 'Simpan Surat Keluar'}
            </button>
          </div>
        </form>
      </Card>

      <Card
        title="Surat Keluar"
        description="Daftar surat keluar dari TP PKK Kelurahan Sungai Ulin."
      >
        <Toolbar
          placeholder="Cari nomor / perihal / tujuan..."
          search={search}
          onSearchChange={setSearch}
          onRefresh={loadData}
        />
        <DataTable
          loading={loading}
          error={error}
          emptyMessage="Belum ada surat keluar."
          columns={['Nomor Surat', 'Tanggal', 'Tujuan', 'Perihal', 'Status', 'Aksi']}
          rows={filtered.map((item) => [
            item.nomor_surat,
            item.tanggal_surat,
            item.tujuan,
            item.perihal,
            item.status,
            <div
              key={`aksi-keluar-${item.id}`}
              className="flex gap-1"
            >
              <button
                type="button"
                onClick={() => handleViewClick(item)}
                className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
              >
                Lihat
              </button>
              <button
                type="button"
                onClick={() => handleEditClick(item)}
                className="rounded-md bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-600"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="rounded-md bg-red-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-600"
              >
                Hapus
              </button>
            </div>,
          ])}
        />
      </Card>

      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span>
          Menampilkan {items.length} dari {pagination.total} data
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => loadData(page - 1)}
            className="rounded-md border border-slate-300 px-2 py-1 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span>
            Hal {page} / {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={page >= (pagination.totalPages || 1)}
            onClick={() => loadData(page + 1)}
            className="rounded-md border border-slate-300 px-2 py-1 disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      </div>

      {selectedItem && (
        <Card
          title="Detail Surat Keluar"
          description="Informasi lengkap surat keluar yang dipilih."
        >
          <div className="grid gap-2 text-xs md:grid-cols-2">
            <DetailRow label="Nomor Surat" value={selectedItem.nomor_surat} />
            <DetailRow label="Tanggal Surat" value={selectedItem.tanggal_surat} />
            <DetailRow label="Tujuan" value={selectedItem.tujuan} />
            <DetailRow label="Perihal" value={selectedItem.perihal} />
            <DetailRow label="Status" value={selectedItem.status} />
            <DetailRow label="Keterangan" value={selectedItem.keterangan} />
          </div>
        </Card>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-xs text-slate-800">{value || '-'}</p>
    </div>
  );
}

export default SuratKeluarPage;


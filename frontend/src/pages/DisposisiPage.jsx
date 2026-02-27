import { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { DataTable, Toolbar } from '../components/TableSection';
import { disposisiApi } from '../utils/api';

function DisposisiPage() {
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
    surat_masuk_id: '',
    tanggal_disposisi: '',
    diteruskan_kepada: '',
    isi_disposisi: '',
    catatan: '',
  });

  const loadData = async (pageToLoad = page) => {
    setLoading(true);
    setError('');
    try {
      const res = await disposisiApi.list({ page: pageToLoad, perPage: 10 });
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
      setError(err.message || 'Gagal memuat disposisi.');
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
      const payload = {
        ...form,
        status: editingId ? selectedItem?.status || 'proses' : 'proses',
        surat_masuk_id: form.surat_masuk_id ? Number(form.surat_masuk_id) : undefined,
      };

      if (editingId) {
        await disposisiApi.update(editingId, payload);
      } else {
        await disposisiApi.create(payload);
      }

      setForm({
        surat_masuk_id: '',
        tanggal_disposisi: '',
        diteruskan_kepada: '',
        isi_disposisi: '',
        catatan: '',
      });
      setEditingId(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Gagal menyimpan disposisi.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus disposisi ini?')) return;
    try {
      await disposisiApi.remove(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Gagal menghapus disposisi.');
    }
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setSelectedItem(item);
    setForm({
      surat_masuk_id: item.surat_masuk_id || '',
      tanggal_disposisi: item.tanggal_disposisi || '',
      diteruskan_kepada: item.diteruskan_kepada || '',
      isi_disposisi: item.isi_disposisi || '',
      catatan: item.catatan || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewClick = (item) => {
    setSelectedItem(item);
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.perihal_surat?.toLowerCase().includes(q) ||
      item.diteruskan_kepada?.toLowerCase().includes(q) ||
      item.isi_disposisi?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <Card
        title={editingId ? 'Edit Disposisi' : 'Tambah Disposisi'}
        description={
          editingId
            ? 'Perbarui data disposisi yang sudah tersimpan.'
            : 'Catat disposisi baru untuk surat masuk.'
        }
      >
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 text-xs md:grid-cols-2"
        >
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              ID Surat Masuk
            </label>
            <input
              name="surat_masuk_id"
              value={form.surat_masuk_id}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
            <p className="text-[10px] text-slate-500">
              Isi dengan ID surat masuk terkait (lihat pada daftar surat masuk).
            </p>
          </div>
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Tanggal Disposisi
            </label>
            <input
              type="date"
              name="tanggal_disposisi"
              value={form.tanggal_disposisi}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-700">
              Diteruskan Kepada
            </label>
            <input
              name="diteruskan_kepada"
              value={form.diteruskan_kepada}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="block font-semibold text-slate-700">
              Isi Disposisi
            </label>
            <textarea
              name="isi_disposisi"
              value={form.isi_disposisi}
              onChange={handleChange}
              rows={3}
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-pkk-primary"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="block font-semibold text-slate-700">
              Catatan (opsional)
            </label>
            <textarea
              name="catatan"
              value={form.catatan}
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
                    surat_masuk_id: '',
                    tanggal_disposisi: '',
                    diteruskan_kepada: '',
                    isi_disposisi: '',
                    catatan: '',
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
                  ? 'Update Disposisi'
                  : 'Simpan Disposisi'}
            </button>
          </div>
        </form>
      </Card>

      <Card
        title="Disposisi Surat Masuk"
        description="Pengaturan disposisi surat masuk kepada kader / pengurus terkait."
      >
        <Toolbar
          placeholder="Cari surat / penerima disposisi..."
          search={search}
          onSearchChange={setSearch}
          onRefresh={loadData}
        />
        <DataTable
          loading={loading}
          error={error}
          emptyMessage="Belum ada disposisi."
          columns={[
            'Tanggal Disposisi',
            'Nomor Surat',
            'Perihal Surat',
            'Diteruskan Kepada',
            'Status',
            'Aksi',
          ]}
          rows={filtered.map((item) => [
            item.tanggal_disposisi,
            item.nomor_surat,
            item.perihal_surat,
            item.diteruskan_kepada,
            item.status,
            <div
              key={`aksi-disposisi-${item.id}`}
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

      {selectedItem && (
        <Card
          title="Detail Disposisi"
          description="Informasi lengkap disposisi yang dipilih."
        >
          <div className="grid gap-2 text-xs md:grid-cols-2">
            <DetailRow label="ID Surat Masuk" value={selectedItem.surat_masuk_id} />
            <DetailRow
              label="Tanggal Disposisi"
              value={selectedItem.tanggal_disposisi}
            />
            <DetailRow
              label="Diteruskan Kepada"
              value={selectedItem.diteruskan_kepada}
            />
            <DetailRow label="Nomor Surat" value={selectedItem.nomor_surat} />
            <DetailRow label="Perihal Surat" value={selectedItem.perihal_surat} />
            <DetailRow label="Status" value={selectedItem.status} />
            <DetailRow label="Isi Disposisi" value={selectedItem.isi_disposisi} />
            <DetailRow label="Catatan" value={selectedItem.catatan} />
          </div>
        </Card>
      )}
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

export default DisposisiPage;


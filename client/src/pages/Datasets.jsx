import React, { useState, useEffect } from 'react';
import { Database, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchDatasets = async () => {
    try {
      const res = await api.get('/datasets');
      setDatasets(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/datasets/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: res.data.message });
      fetchDatasets();
      setFile(null);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to import CSV' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dataset Management & Kaggle Importer</h1>
        <p className="text-xs text-slate-500 mt-0.5">Import e-commerce clickstream CSV datasets (Kaggle benchmarks, e-Shop clickstream) for direct funnel-path modeling</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-900 block">Kaggle Clickstream Benchmark</span>
          <p className="text-slate-500">Supports Kaggle session-level page views, clicks, cart additions, and payment failures.</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-900 block">e-Shop Clickstream Dataset</span>
          <p className="text-slate-500">Auto-maps e-Shop benchmark columns (`session ID`, `price`, `page 1`, `order`).</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="font-bold text-slate-900 block">Multi-table Schema</span>
          <p className="text-slate-500">Ingests sessions, customers, order items, and checkout events seamlessly into MongoDB.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Upload Kaggle Clickstream Dataset (CSV)</h3>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Choose a Kaggle Clickstream CSV file or drag & drop here</p>
            <p className="text-[11px] text-slate-400 mt-1">Supports standard headers: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">session_id, customer_id, cart_value, time_on_page, product_views, payment_attempts, payment_failures, checkout_started, purchase_completed</code></p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-3 text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          {file && (
            <div className="flex items-center justify-between text-xs p-3 bg-blue-50 rounded-lg text-blue-900">
              <span className="font-semibold">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                {uploading ? 'Processing & Validating...' : 'Import Dataset'}
              </button>
            </div>
          )}
        </form>

        {message && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Dataset Import History</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {datasets.length === 0 ? (
            <p className="py-4 text-center text-slate-400">No imported datasets yet.</p>
          ) : (
            datasets.map((d) => (
              <div key={d._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-900">{d.filename}</p>
                    <p className="text-slate-400 text-[11px]">{d.datasetSource || 'Kaggle Benchmark'} • Uploaded {new Date(d.uploadedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span>{d.importedSessions} Sessions Ingested</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold uppercase text-[10px]">{d.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/StatusBadge';

function AdminComplaints() {
  const { complaints, toggleComplaintStatus, universities } = useData();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [assignUniModal, setAssignUniModal] = useState(false);
  const [chosenUni, setChosenUni] = useState(universities?.[0]?.name || 'Birla Institute of Technology, Mesra');

  const filtered = useMemo(() => {
    return complaints.filter((c) => {
      return (
        c.urn?.toLowerCase().includes(search.toLowerCase()) ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.citizen?.toLowerCase().includes(search.toLowerCase()) ||
        c.location?.district?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [complaints, search]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchAssign = () => {
    showToast(`Batch assigned ${selectedIds.length} grievances to ${chosenUni}`, 'success');
    setAssignUniModal(false);
    setSelectedIds([]);
  };

  const handleToggleStatus = (id, e) => {
    e.stopPropagation();
    toggleComplaintStatus(id);
    showToast('Complaint status updated in state registry', 'success');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary-container/20 text-primary border border-primary-container/40 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            <span>Jharkhand State Nodal Command & Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {t('nav_admin_matrix', 'Officer Grievance Triage Matrix')}
          </h1>
          <p className="text-sm text-secondary max-w-2xl leading-relaxed">
            {t('admin_table_desc', 'Jharkhand State master audit registry for SLA monitoring, district escalation, and academic hub matching.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-5 py-3 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-2xl text-xs font-bold text-on-surface transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            <span>Analytics Dashboard</span>
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={() => setAssignUniModal(true)}
              className="px-5 py-3 bg-primary-container hover:bg-orange-600 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">school</span>
              <span>Assign to University ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-secondary text-lg">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter matrix by URN, citizen name, category, district..."
            className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2 text-on-surface text-sm focus:border-primary-container outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-secondary shrink-0">
          <span className="font-bold text-on-surface">{filtered.length}</span> Records in View
        </div>
      </div>

      {/* Master Matrix Table */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-surface-container-highest text-secondary text-xs font-semibold">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    className="w-4 h-4 rounded text-primary-container"
                  />
                </th>
                <th className="p-4">URN / Registration</th>
                <th className="p-4">Grievance Particulars</th>
                <th className="p-4">Jurisdiction</th>
                <th className="p-4">SLA Window</th>
                <th className="p-4">Status & Action</th>
                <th className="p-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {filtered.map((row) => {
                const isSelected = selectedIds.includes(row._id);
                const isCritical = row.urgencyLevel === 'critical' || (row.urgency || '').includes('12 Hours');

                return (
                  <tr
                    key={row._id}
                    onClick={() => navigate(`/complaints/${row._id}`)}
                    className={`cursor-pointer hover:bg-surface-container/80 transition-colors ${
                      isSelected ? 'bg-primary-container/10' : ''
                    }`}
                  >
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(row._id)}
                        className="w-4 h-4 rounded text-primary-container"
                      />
                    </td>

                    <td className="p-4">
                      <span className="font-code-num font-bold text-primary block">{row.urn}</span>
                      <span className="text-[11px] text-secondary">{row.date || row.createdAt?.split('T')[0]}</span>
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-on-surface line-clamp-1">{row.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-secondary">{row.category}</span>
                        {isCritical && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-error-container/40 text-error">
                            Critical
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-medium text-on-surface">{row.location?.district || 'Ranchi'}</p>
                      <span className="text-[11px] text-secondary">{row.location?.state || 'Jharkhand'}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-code-num font-bold text-primary block">
                        {row.slaLeft || '24h Left'}
                      </span>
                      <span className="text-[11px] text-secondary">{row.department || 'DWSD Jharkhand'}</span>
                    </td>

                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={row.status} />
                        <button
                          onClick={(e) => handleToggleStatus(row._id, e)}
                          title="Toggle Status (Resolved / In Progress)"
                          className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface border border-surface-container-highest"
                        >
                          <span className="material-symbols-outlined text-sm">sync</span>
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/complaints/${row._id}`);
                        }}
                        className="text-primary hover:underline font-bold text-xs flex items-center gap-1 justify-end"
                      >
                        <span>Inspect</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* University Assignment Modal */}
      {assignUniModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
              <h3 className="text-lg font-bold text-on-surface">Batch University Allocation</h3>
              <button
                onClick={() => setAssignUniModal(false)}
                className="text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-secondary">
                Select accredited university incubation hub to dispatch <span className="font-bold text-on-surface">{selectedIds.length}</span> selected grievances:
              </p>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">Target Institution</label>
                <select
                  value={chosenUni}
                  onChange={(e) => setChosenUni(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-on-surface text-sm focus:border-primary-container outline-none"
                >
                  <option value="Birla Institute of Technology, Mesra">Birla Institute of Technology, Mesra (AISHE: U-0120)</option>
                  <option value="NIT Jamshedpur">NIT Jamshedpur (AISHE: U-0204)</option>
                  <option value="IIT (ISM) Dhanbad Innovation Hub">IIT (ISM) Dhanbad Innovation Hub (AISHE: U-0205)</option>
                  <option value="BIT Sindri Technology Cell">BIT Sindri Technology Cell (AISHE: U-0208)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignUniModal(false)}
                  className="px-4 py-2 bg-surface-container rounded-xl text-xs font-semibold text-secondary hover:text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBatchAssign}
                  className="px-6 py-2 bg-primary-container hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminComplaints;

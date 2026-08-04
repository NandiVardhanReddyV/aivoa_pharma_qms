import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Plus,
  ArrowRight
} from 'lucide-react';

export default function CapaTable({ complaint }) {
  if (!complaint) return null;
  const capasInitial = complaint.capas || [];
  const [capaList, setCapaList] = useState(capasInitial);

  const toggleStatus = (id) => {
    setCapaList(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Open' ? 'Completed' : 'Open';
        return { ...c, status: nextStatus, verified_by: nextStatus === 'Completed' ? 'QA Lead' : null };
      }
      return c;
    }));
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#10b981" />
          Corrective & Preventive Action Plan (CAPA Studio)
        </h3>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {capaList.filter(c => c.status === 'Completed').length} / {capaList.length} CAPAs Resolved
        </span>
      </div>

      {capaList.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          No CAPA items currently assigned for this complaint.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px' }}>CAPA ID</th>
                <th style={{ padding: '12px 16px' }}>Type</th>
                <th style={{ padding: '12px 16px' }}>Action Description</th>
                <th style={{ padding: '12px 16px' }}>Assigned Dept</th>
                <th style={{ padding: '12px 16px' }}>Target Timeline</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Toggle Status</th>
              </tr>
            </thead>
            <tbody>
              {capaList.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                    {c.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={c.capa_type.includes('Corrective') ? 'pill pill-critical' : 'pill pill-fdf'} style={{ fontSize: '0.65rem' }}>
                      {c.capa_type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 500 }}>
                    {c.description}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                    {c.assigned_department}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} color="#f59e0b" />
                      {c.target_completion_days} Days
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: c.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: c.status === 'Completed' ? '#6ee7b7' : '#fcd34d',
                      border: c.status === 'Completed' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)'
                    }}>
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => toggleStatus(c.id)}
                      className={c.status === 'Completed' ? 'btn-secondary' : 'btn-primary'}
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      {c.status === 'Completed' ? 'Re-open' : 'Mark Completed'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

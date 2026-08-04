import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedComplaint,
  setActiveTab,
  setSearchQuery,
  setSeverityFilter,
  setProductTypeFilter
} from '../store/complaintSlice';
import {
  AlertTriangle,
  FileCheck2,
  Package,
  Layers,
  Search,
  Filter,
  ChevronRight,
  ShieldAlert,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const dispatch = useDispatch();
  const {
    list,
    analytics,
    searchQuery,
    severityFilter,
    productTypeFilter,
    loading
  } = useSelector((state) => state.complaints);

  // Filter complaints list
  const filteredList = list.filter((c) => {
    const matchesSearch =
      (c.id && c.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.product_name && c.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.defect_title && c.defect_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.batch_number && c.batch_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSeverity = severityFilter ? c.severity === severityFilter : true;
    const matchesType = productTypeFilter ? c.product_type === productTypeFilter : true;

    return matchesSearch && matchesSeverity && matchesType;
  });

  const handleSelectComplaint = (complaint) => {
    dispatch(setSelectedComplaint(complaint));
    dispatch(setActiveTab('detail'));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }} className="animate-fade-in">
      {/* Overview Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL COMPLAINTS</span>
            <Package size={20} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{analytics.total_complaints}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {analytics.fdf_product_complaints} FDF | {analytics.api_product_complaints} API
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>CRITICAL HAZARDS</span>
            <AlertTriangle size={20} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f43f5e' }}>{analytics.critical_severity}</div>
          <div style={{ fontSize: '0.75rem', color: '#fda4af', marginTop: '4px' }}>
            Immediate QA triage required
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>FDA 15-DAY ALERTS</span>
            <ShieldAlert size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fcd34d' }}>{analytics.fda_15day_alerts}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Regulatory Field Alert trigger
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>AVG COMPLETENESS</span>
            <FileCheck2 size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{analytics.avg_completeness_score}%</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            21 CFR 211.198 data score
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search by Complaint ID, Product Name, Batch #, or Defect..."
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={16} color="#94a3b8" />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => dispatch(setSeverityFilter(e.target.value))}
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Type:</span>
            <select
              value={productTypeFilter}
              onChange={(e) => dispatch(setProductTypeFilter(e.target.value))}
              style={{ width: 'auto', padding: '6px 12px' }}
            >
              <option value="">All Types (FDF & API)</option>
              <option value="Finished Dosage Form (FDF)">Finished Dosage Form (FDF)</option>
              <option value="Active Pharmaceutical Ingredient (API)">Active Pharmaceutical Ingredient (API)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#06b6d4" />
            Registered Customer Complaints Log
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Showing {filteredList.length} records
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Loading complaints data from QMS database...
          </div>
        ) : filteredList.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No complaints found matching current search criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.8)', borderBottom: '1px solid var(--border-color)', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 20px' }}>Complaint ID</th>
                  <th style={{ padding: '14px 16px' }}>Product & Category</th>
                  <th style={{ padding: '14px 16px' }}>Batch #</th>
                  <th style={{ padding: '14px 16px' }}>Severity</th>
                  <th style={{ padding: '14px 16px' }}>Risk Score (RPN)</th>
                  <th style={{ padding: '14px 16px' }}>15-Day Alert</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => handleSelectComplaint(c)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#38bdf8' }}>
                      {c.id}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{c.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '6px', marginTop: '2px' }}>
                        <span className={c.product_type.includes('API') ? 'pill pill-api' : 'pill pill-fdf'} style={{ fontSize: '0.65rem' }}>
                          {c.product_type.includes('API') ? 'API' : 'FDF'}
                        </span>
                        <span>{c.complaint_category}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#cbd5e1' }}>
                      {c.batch_number || 'N/A'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`pill ${
                        c.severity === 'Critical' ? 'pill-critical' : c.severity === 'Major' ? 'pill-major' : 'pill-minor'
                      }`}>
                        {c.severity}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '40px',
                          height: '6px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${c.risk_priority_number}%`,
                            height: '100%',
                            background: c.risk_priority_number > 75 ? '#f43f5e' : c.risk_priority_number > 50 ? '#f59e0b' : '#10b981'
                          }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: c.risk_priority_number > 75 ? '#f43f5e' : c.risk_priority_number > 50 ? '#fcd34d' : '#6ee7b7' }}>
                          {c.risk_priority_number}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {c.fda_15day_alert_required ? (
                        <span className="pill pill-critical" style={{ fontSize: '0.65rem' }}>
                          <ShieldAlert size={12} /> REQUIRED
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Standard</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'rgba(30, 41, 59, 0.9)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.3)'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        Investigate <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

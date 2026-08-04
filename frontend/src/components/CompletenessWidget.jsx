import React, { useState } from 'react';
import {
  CheckSquare,
  AlertCircle,
  Mail,
  Copy,
  Check,
  FileSearch,
  Sparkles
} from 'lucide-react';

export default function CompletenessWidget({ complaint }) {
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!complaint) return null;
  const risk = complaint.risk_assessment || {};
  const missingFields = risk.missing_critical_fields || [];
  const score = complaint.completeness_score || 75.0;

  const handleCopyEmail = () => {
    if (risk.followup_email_draft) {
      navigator.clipboard.writeText(risk.followup_email_draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSearch size={18} color="#10b981" />
          Complaint Completeness Checker (21 CFR Part 211.198)
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Data Score:</span>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: score > 80 ? '#10b981' : score > 60 ? '#f59e0b' : '#f43f5e' }}>
            {score}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '8px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{
          height: '100%',
          width: `${score}%`,
          background: score > 80 ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #f43f5e)'
        }} />
      </div>

      {/* Missing Fields Checklist */}
      {missingFields.length > 0 ? (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fcd34d', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> Missing Regulatory Data Parameters:
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '4px' }}>
            {missingFields.map((f, i) => (
              <li key={i} style={{ fontSize: '0.78rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.8rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={16} /> All mandatory 21 CFR complaint data points verified complete.
        </div>
      )}

      {/* Follow-up Email Action */}
      {risk.followup_email_draft && (
        <div>
          <button
            onClick={() => setShowEmail(!showEmail)}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', width: '100%', justifyContent: 'center' }}
          >
            <Mail size={14} />
            {showEmail ? 'Hide AI Follow-up Email Draft' : 'View AI-Generated Follow-up Request Email Draft'}
          </button>

          {showEmail && (
            <div style={{ marginTop: '12px', background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.3)' }} className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> AI Follow-Up Draft (To: {complaint.contact_email || 'Customer'})
                </span>
                <button
                  onClick={handleCopyEmail}
                  style={{ background: 'transparent', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Email'}
                </button>
              </div>
              <pre style={{ fontSize: '0.8rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-inter)' }}>
                {risk.followup_email_draft}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

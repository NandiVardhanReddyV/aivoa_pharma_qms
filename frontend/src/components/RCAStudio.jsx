import React from 'react';
import {
  GitMerge,
  HelpCircle,
  CheckCircle2,
  Workflow,
  Wrench,
  Boxes,
  ScrollText
} from 'lucide-react';

export default function RCAStudio({ complaint }) {
  if (!complaint) return null;
  const rca = complaint.rca || {};

  const whySteps = [
    { num: 1, label: 'Why 1', text: rca.why_1 },
    { num: 2, label: 'Why 2', text: rca.why_2 },
    { num: 3, label: 'Why 3', text: rca.why_3 },
    { num: 4, label: 'Why 4', text: rca.why_4 },
    { num: 5, label: 'Why 5 (Root Cause)', text: rca.why_5 }
  ].filter(w => w.text);

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Workflow size={20} color="#8b5cf6" />
          5-Why Analysis & Ishikawa Root Cause Studio
        </h3>
        <span className="pill pill-api" style={{ fontSize: '0.7rem' }}>
          <Boxes size={12} /> {rca.ishikawa_category || 'Machine & Process'}
        </span>
      </div>

      {/* Primary Root Cause Highlight Card */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.12)',
        border: '1px solid rgba(139, 92, 246, 0.4)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '22px'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
          IDENTIFIED PRIMARY ROOT CAUSE:
        </span>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
          {rca.primary_root_cause || 'Comprehensive laboratory investigation in progress.'}
        </div>
      </div>

      {/* 5-Why Timeline Flow */}
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
          AUTONOMOUS 5-WHY CAUSAL LOGIC CHAIN:
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {whySteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '12px 16px',
                borderRadius: '8px',
                borderLeft: idx === whySteps.length - 1 ? '4px solid #8b5cf6' : '3px solid #38bdf8'
              }}
            >
              <div style={{
                background: idx === whySteps.length - 1 ? '#8b5cf6' : '#0284c7',
                color: 'white',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                flexShrink: 0
              }}>
                {step.label}
              </div>
              <div style={{ fontSize: '0.84rem', color: idx === whySteps.length - 1 ? '#f8fafc' : '#cbd5e1', fontWeight: idx === whySteps.length - 1 ? 700 : 400 }}>
                {step.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investigation Summary */}
      {rca.investigation_summary && (
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <ScrollText size={14} /> Quality Investigation Summary:
          </span>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
            {rca.investigation_summary}
          </p>
        </div>
      )}
    </div>
  );
}

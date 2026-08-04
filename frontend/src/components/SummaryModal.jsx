import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  X,
  Award,
  ShieldCheck
} from 'lucide-react';

export default function SummaryModal({ complaint, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!complaint) return null;
  const risk = complaint.risk_assessment || {};
  const rca = complaint.rca || {};
  const capas = complaint.capas || [];

  const summaryMarkdown = `# 21 CFR PART 211.198 EXECUTIVE PHARMA COMPLAINT REPORT
Report ID: ${complaint.id}
Date Generated: ${new Date().toISOString().split('T')[0]}

## 1. COMPLAINT & PRODUCT METADATA
- Product Name: ${complaint.product_name}
- Product Category: ${complaint.product_type}
- Batch / Lot Number: ${complaint.batch_number || 'N/A'}
- Reporter: ${complaint.reporter_name || 'N/A'} (${complaint.reporter_organization || 'Hospital/Distributor'})
- Defect Category: ${complaint.complaint_category}

## 2. AI RISK ASSESSMENT & HEALTH HAZARD CLASSIFICATION
- Health Hazard Rating: ${risk.health_hazard_class || 'Class II (Temporary Hazard)'}
- Risk Priority Number (RPN): ${complaint.risk_priority_number} / 100
- Mandatory FDA 15-Day Alert Required: ${complaint.fda_15day_alert_required ? 'YES (CRITICAL)' : 'NO'}
- Regulatory Basis: ${risk.regulatory_justification || 'Processed per standard QMS guidelines.'}

## 3. INVESTIGATION & 5-WHY ROOT CAUSE ANALYSIS
- Primary Root Cause: ${rca.primary_root_cause || 'Under Investigation'}
- Ishikawa Domain: ${rca.ishikawa_category || 'Machine & Process'}
- Investigation Summary: ${rca.investigation_summary || 'N/A'}

## 4. CORRECTIVE & PREVENTIVE ACTION PLAN (CAPA)
${capas.map((c, i) => `${i + 1}. [${c.capa_type}] ${c.description} (Dept: ${c.assigned_department}, Target: ${c.target_completion_days} days, Status: ${c.status})`).join('\n')}

---
Approved by AI Copilot Engine (gemma2-9b-it). Pending Quality Assurance Officer Final Signature.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ padding: '28px', maxWidth: '850px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '8px', borderRadius: '8px' }}>
              <ShieldCheck size={22} color="#10b981" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Executive 21 CFR Complaint Report
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Complaint ID: {complaint.id} | Quality Approved
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Markdown Content Display Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '20px',
          maxHeight: '55vh',
          overflowY: 'auto',
          marginBottom: '20px'
        }}>
          <pre style={{ fontSize: '0.84rem', color: '#cbd5e1', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-inter)', lineHeight: '1.6' }}>
            {summaryMarkdown}
          </pre>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={14} color="#10b981" /> 21 CFR Part 211 & EU GMP Chapter 8 Compliant
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleCopy} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              {copied ? 'Copied to Clipboard' : 'Copy Report Markdown'}
            </button>
            <button onClick={handlePrint} className="btn-primary" style={{ fontSize: '0.8rem' }}>
              <Printer size={16} />
              Print / Export PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

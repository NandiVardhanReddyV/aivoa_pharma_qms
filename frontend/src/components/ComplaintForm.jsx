import React from 'react';
import {
  Building2,
  Package,
  Calendar,
  FlaskConical,
  Pill,
  CheckCircle2,
  XCircle,
  FileCheck2
} from 'lucide-react';

export default function ComplaintForm({ complaint }) {
  if (!complaint) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck2 size={20} color="#06b6d4" />
          Log Customer Complaint Form (21 CFR Part 211.198)
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className={complaint.product_type.includes('API') ? 'pill pill-api' : 'pill pill-fdf'}>
            {complaint.product_type}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 8px', borderRadius: '6px' }}>
            ID: <strong style={{ color: '#38bdf8' }}>{complaint.id}</strong>
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Section 1: Customer / Reporter Details */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Building2 size={14} /> Reporter & Customer Info
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Reporter Name:</span>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{complaint.reporter_name || 'N/A'}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Organization / Hospital:</span>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{complaint.reporter_organization || 'N/A'}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Contact Email:</span>
              <div style={{ fontWeight: 500, color: '#cbd5e1' }}>{complaint.contact_email || 'N/A'}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Country:</span>
              <div style={{ fontWeight: 500, color: '#cbd5e1' }}>{complaint.country || 'USA'}</div>
            </div>
          </div>
        </div>

        {/* Section 2: Product & Batch Specifications */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Package size={14} /> Product & Batch Specifications
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Product Name:</span>
              <div style={{ fontWeight: 700, color: '#38bdf8' }}>{complaint.product_name}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Batch / Lot #:</span>
                <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#fcd34d' }}>{complaint.batch_number || 'UNSPECIFIED'}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Sample Received:</span>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: complaint.sample_received ? '#10b981' : '#f43f5e' }}>
                  {complaint.sample_received ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {complaint.sample_received ? 'YES (QC Received)' : 'NO (Pending Return)'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Mfg Date:</span>
                <div style={{ color: '#cbd5e1' }}>{complaint.manufacturing_date || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Expiry Date:</span>
                <div style={{ color: '#cbd5e1' }}>{complaint.expiry_date || 'N/A'}</div>
              </div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Manufacturing Facility:</span>
              <div style={{ color: '#cbd5e1' }}>{complaint.manufacturing_site || 'Site Alpha'}</div>
            </div>
          </div>
        </div>

        {/* Section 3: Defect & Category Details */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)', gridColumn: 'span 1' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Pill size={14} /> Defect Classification & Description
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Defect Title:</span>
              <div style={{ fontWeight: 700, color: '#f8fafc' }}>{complaint.defect_title}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Complaint Category:</span>
              <div style={{ color: '#cbd5e1' }}>{complaint.complaint_category}</div>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Description:</span>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', background: 'rgba(30, 41, 59, 0.8)', padding: '8px', borderRadius: '6px', marginTop: '4px', maxHeight: '90px', overflowY: 'auto' }}>
                {complaint.defect_description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

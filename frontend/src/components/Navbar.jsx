import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedModel, setActiveTab } from '../store/complaintSlice';
import { ShieldCheck, Cpu, PlusCircle, LayoutDashboard, FileText, Activity } from 'lucide-react';

export default function Navbar() {
  const dispatch = useDispatch();
  const { selectedModel, activeTab, analytics } = useSelector((state) => state.complaints);

  return (
    <header style={{
      background: 'rgba(15, 23, 42, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand & QMS Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <ShieldCheck size={26} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AIVOA Pharma QMS
              </span>
              <span className="pill pill-fdf" style={{ fontSize: '0.65rem' }}>
                21 CFR Part 211
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              AI Customer Complaint & Risk Copilot (API & FDF)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(30, 41, 59, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            onClick={() => dispatch(setActiveTab('dashboard'))}
            className={`btn-secondary ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            <LayoutDashboard size={16} />
            Dashboard ({analytics.total_complaints})
          </button>
          <button
            onClick={() => dispatch(setActiveTab('detail'))}
            className={`btn-secondary ${activeTab === 'detail' ? 'btn-primary' : ''}`}
            style={{ fontSize: '0.85rem', padding: '6px 14px' }}
          >
            <Activity size={16} />
            Active Investigation
          </button>
        </nav>

        {/* Right Actions & LLM Model Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Groq Model Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.8)', padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <Cpu size={16} color="#06b6d4" />
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Groq LLM:</span>
            <select
              value={selectedModel}
              onChange={(e) => dispatch(setSelectedModel(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 4px'
              }}
            >
              <option value="gemma2-9b-it" style={{ background: '#1e293b', color: '#fff' }}>gemma2-9b-it (Default)</option>
              <option value="llama-3.3-70b-versatile" style={{ background: '#1e293b', color: '#fff' }}>llama-3.3-70b-versatile (Context)</option>
            </select>
          </div>

          {/* New Complaint Button */}
          <button
            onClick={() => dispatch(setActiveTab('intake'))}
            className="btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <PlusCircle size={18} />
            Ingest AI Complaint
          </button>
        </div>
      </div>
    </header>
  );
}

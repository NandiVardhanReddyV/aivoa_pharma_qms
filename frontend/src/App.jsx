import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaints, fetchAnalytics, setActiveTab } from './store/complaintSlice';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ComplaintForm from './components/ComplaintForm';
import CopilotPanel from './components/CopilotPanel';
import CompletenessWidget from './components/CompletenessWidget';
import RCAStudio from './components/RCAStudio';
import CapaTable from './components/CapaTable';
import IntakeModal from './components/IntakeModal';
import SummaryModal from './components/SummaryModal';

import {
  FileText,
  ArrowLeft,
  Sparkles,
  Award,
  Layers,
  Activity
} from 'lucide-react';

export default function App() {
  const dispatch = useDispatch();
  const { activeTab, selectedComplaint, list, loading } = useSelector((state) => state.complaints);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  useEffect(() => {
    dispatch(fetchComplaints());
    dispatch(fetchAnalytics());
  }, [dispatch]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'detail' && (
          <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }} className="animate-fade-in">
            {/* Top Navigation & Action Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <button
                onClick={() => dispatch(setActiveTab('dashboard'))}
                className="btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                <ArrowLeft size={16} /> Back to Dashboard
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Select Complaint:
                </span>
                <select
                  value={selectedComplaint ? selectedComplaint.id : ''}
                  onChange={(e) => {
                    const found = list.find(c => c.id === e.target.value);
                    if (found) dispatch({ type: 'complaints/setSelectedComplaint', payload: found });
                  }}
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                >
                  {list.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.product_name} ({c.severity})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowSummaryModal(true)}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  <FileText size={16} />
                  View 21 CFR Executive Summary
                </button>
              </div>
            </div>

            {selectedComplaint ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                {/* 1. Log Customer Complaint Form */}
                <ComplaintForm complaint={selectedComplaint} />

                {/* 2. AI Copilot Risk Assessment Panel */}
                <CopilotPanel complaint={selectedComplaint} />

                {/* 3. Grid for Completeness & RCA */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                  <CompletenessWidget complaint={selectedComplaint} />
                  <RCAStudio complaint={selectedComplaint} />
                </div>

                {/* 4. CAPA Studio */}
                <CapaTable complaint={selectedComplaint} />
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                <Activity size={48} color="#06b6d4" style={{ marginBottom: '12px' }} />
                <h3>No active complaint selected</h3>
                <p style={{ marginTop: '6px' }}>Select a complaint from the dashboard or ingest a new document.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {activeTab === 'intake' && (
        <IntakeModal onClose={() => dispatch(setActiveTab('dashboard'))} />
      )}

      {showSummaryModal && selectedComplaint && (
        <SummaryModal
          complaint={selectedComplaint}
          onClose={() => setShowSummaryModal(false)}
        />
      )}

      {/* Footer */}
      <footer style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        fontSize: '0.78rem',
        color: '#94a3b8',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          © 2026 <strong>AIVOA Pharma QMS</strong> – AI Product Engineer Customer Complaint Management System
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Framework: <strong>LangGraph DAG</strong></span>
          <span>LLM: <strong>Groq gemma2-9b-it / llama-3.3-70b</strong></span>
          <span>Compliance: <strong>FDA 21 CFR Part 211.198</strong></span>
        </div>
      </footer>
    </div>
  );
}

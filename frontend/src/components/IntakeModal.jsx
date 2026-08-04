import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ingestComplaint, setActiveTab } from '../store/complaintSlice';
import {
  UploadCloud,
  FileText,
  Sparkles,
  X,
  FileCheck,
  Zap,
  AlertCircle,
  FlaskConical,
  Pill
} from 'lucide-react';

export default function IntakeModal({ onClose }) {
  const dispatch = useDispatch();
  const { ingesting, selectedModel } = useSelector((state) => state.complaints);

  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const sampleFDFText = `FORMAL PHARMACEUTICAL QUALITY COMPLAINT REPORT
Product Name: Paracetamol 500mg Film-Coated Tablets
Product Type: Finished Dosage Form (FDF)
Batch Number: PCT-2024-8841
Reporter: Dr. Sarah Jenkins, Hospital Pharmacist (St. Jude Hospital)
Contact Email: s.jenkins@stjude-hospital.org

Complaint Details:
Upon opening aluminum blister packs of Batch PCT-2024-8841, hospital pharmacy staff noticed top crowns of tablets split horizontally (capping) in 4 out of 10 blister pockets. Loose powder debris was present inside blister pockets. Physical retention sample is available for return QC testing.`;

  const sampleAPIText = `QUALITY CONTROL OUT-OF-SPECIFICATION (OOS) COMPLAINT NOTICE
Product Name: Metformin Hydrochloride API (Micro-grained)
Product Type: Active Pharmaceutical Ingredient (API)
Vendor Lot Number: MET-API-9902
Reporter: Elena Rostova, QC Director (Apex Formulations GmbH)
Contact Email: e.rostova@apexformulations.de

Complaint Details:
Incoming qualification testing via HPLC revealed an unknown degradation impurity peak at RRT 1.45 at 0.18% w/w, exceeding the USP monograph specification limit of NMT 0.10% w/w. Bulk drum seals intact. Raw material quarantined. Requesting urgent 15-day regulatory field alert notification per EU GMP Chapter 8 / FDA 21 CFR Part 211.198.`;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textInput && !selectedFile) return;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('model_name', selectedModel);
      await dispatch(ingestComplaint({ data: formData, isFile: true }));
    } else {
      await dispatch(ingestComplaint({
        data: { text_content: textInput, model_name: selectedModel },
        isFile: false
      }));
    }

    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.2)', padding: '10px', borderRadius: '10px' }}>
              <Sparkles size={22} color="#06b6d4" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                AI Complaint Intake & Parser Hub
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Extract metadata & run autonomous LangGraph 21 CFR Risk Pipeline ({selectedModel})
              </p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          )}
        </div>

        {/* Quick Sample Loaders */}
        <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px', borderRadius: '10px', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            <Zap size={14} style={{ display: 'inline', marginRight: '4px' }} /> Quick Load Sample Complaints for Testing:
          </span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setTextInput(sampleFDFText); setSelectedFile(null); }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px', background: 'rgba(56, 189, 248, 0.15)', borderColor: 'rgba(56, 189, 248, 0.3)', color: '#7dd3fc' }}
            >
              <Pill size={14} /> FDF Sample: Paracetamol Capping
            </button>
            <button
              type="button"
              onClick={() => { setTextInput(sampleAPIText); setSelectedFile(null); }}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px 12px', background: 'rgba(168, 85, 247, 0.15)', borderColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc' }}
            >
              <FlaskConical size={14} /> API Sample: Metformin OOS Impurity
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* File Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragOver ? '#06b6d4' : selectedFile ? '#10b981' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center',
              background: isDragOver ? 'rgba(6, 182, 212, 0.05)' : 'rgba(15, 23, 42, 0.5)',
              marginBottom: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.txt,.doc,.docx,.eml"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
              {selectedFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10b981', fontWeight: 600 }}>
                  <FileCheck size={28} />
                  <span>File Selected: {selectedFile.name}</span>
                </div>
              ) : (
                <div>
                  <UploadCloud size={36} color="#06b6d4" style={{ marginBottom: '8px' }} />
                  <p style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                    Drag & Drop Customer Complaint PDF / Email / Document
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Supports PDF, EML, TXT (Auto OCR & Layout Parsing)
                  </p>
                </div>
              )}
            </label>
          </div>

          <div style={{ textAlign: 'center', margin: '-10px 0 14px 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
            - OR PASTE UNSTRUCTURED COMPLAINT TEXT BELOW -
          </div>

          {/* Raw Text Prompt Input */}
          <div style={{ marginBottom: '24px' }}>
            <textarea
              rows={6}
              placeholder="Paste raw email transcript, telephone report, or customer complaint description..."
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); setSelectedFile(null); }}
              style={{ width: '100%', fontSize: '0.88rem' }}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {onClose && (
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={ingesting || (!textInput && !selectedFile)}
              className="btn-primary"
              style={{ minWidth: '180px', justifyContent: 'center' }}
            >
              {ingesting ? (
                <>
                  <Sparkles className="animate-spin" size={18} />
                  Running LangGraph AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Ingest & Process Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

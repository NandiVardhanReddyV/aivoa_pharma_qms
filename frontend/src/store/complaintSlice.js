import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchComplaintsApi,
  fetchComplaintByIdApi,
  ingestComplaintApi,
  reassessComplaintApi,
  fetchAnalyticsApi
} from '../utils/api';

// Async Thunks
export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async ({ severity = '', productType = '' } = {}) => {
    return await fetchComplaintsApi(severity, productType);
  }
);

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchComplaintById',
  async (id) => {
    return await fetchComplaintByIdApi(id);
  }
);

export const ingestComplaint = createAsyncThunk(
  'complaints/ingestComplaint',
  async ({ data, isFile = false }) => {
    return await ingestComplaintApi(data, isFile);
  }
);

export const reassessComplaint = createAsyncThunk(
  'complaints/reassessComplaint',
  async ({ id, modelName }) => {
    return await reassessComplaintApi(id, modelName);
  }
);

export const fetchAnalytics = createAsyncThunk(
  'complaints/fetchAnalytics',
  async () => {
    return await fetchAnalyticsApi();
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    list: [],
    selectedComplaint: null,
    analytics: {
      total_complaints: 0,
      critical_severity: 0,
      major_severity: 0,
      fda_15day_alerts: 0,
      fdf_product_complaints: 0,
      api_product_complaints: 0,
      avg_completeness_score: 0
    },
    selectedModel: 'gemma2-9b-it', // Default Groq model
    versatileModel: 'llama-3.3-70b-versatile',
    loading: false,
    ingesting: false,
    reassessing: false,
    error: null,
    activeTab: 'dashboard', // dashboard, intake, detail
    searchQuery: '',
    severityFilter: '',
    productTypeFilter: ''
  },
  reducers: {
    setSelectedModel: (state, action) => {
      state.selectedModel = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSeverityFilter: (state, action) => {
      state.severityFilter = action.payload;
    },
    setProductTypeFilter: (state, action) => {
      state.productTypeFilter = action.payload;
    }
  },
  extraReducers: (builder) => {
    // fetchComplaints
    builder.addCase(fetchComplaints.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchComplaints.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
      if (!state.selectedComplaint && action.payload.length > 0) {
        state.selectedComplaint = action.payload[0];
      }
    });
    builder.addCase(fetchComplaints.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // fetchComplaintById
    builder.addCase(fetchComplaintById.fulfilled, (state, action) => {
      state.selectedComplaint = action.payload;
    });

    // ingestComplaint
    builder.addCase(ingestComplaint.pending, (state) => {
      state.ingesting = true;
      state.error = null;
    });
    builder.addCase(ingestComplaint.fulfilled, (state, action) => {
      state.ingesting = false;
      state.list.unshift(action.payload);
      state.selectedComplaint = action.payload;
      state.activeTab = 'detail';
    });
    builder.addCase(ingestComplaint.rejected, (state, action) => {
      state.ingesting = false;
      state.error = action.error.message;
    });

    // reassessComplaint
    builder.addCase(reassessComplaint.pending, (state) => {
      state.reassessing = true;
    });
    builder.addCase(reassessComplaint.fulfilled, (state, action) => {
      state.reassessing = false;
      state.selectedComplaint = action.payload;
      const idx = state.list.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = action.payload;
      }
    });
    builder.addCase(reassessComplaint.rejected, (state, action) => {
      state.reassessing = false;
      state.error = action.error.message;
    });

    // fetchAnalytics
    builder.addCase(fetchAnalytics.fulfilled, (state, action) => {
      state.analytics = action.payload;
    });
  }
});

export const {
  setSelectedModel,
  setActiveTab,
  setSelectedComplaint,
  setSearchQuery,
  setSeverityFilter,
  setProductTypeFilter
} = complaintSlice.actions;

export default complaintSlice.reducer;

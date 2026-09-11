import api from './api';

function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 300);
}

function extractFilename(contentDisposition, defaultName) {
  if (!contentDisposition) return defaultName;
  const match = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
  return match && match[1] ? match[1].trim() : defaultName;
}

async function handleBlobResponse(resPromise, defaultName) {
  try {
    const response = await resPromise;
    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data], {
          type: response.headers?.['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
    const filename = extractFilename(response.headers?.['content-disposition'], defaultName);
    triggerDownload(blob, filename);
    return { success: true, filename };
  } catch (err) {
    let errorMsg = 'Export failed. Please try again.';
    if (err.response) {
      if (err.response.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          errorMsg = json.message || errorMsg;
        } catch (e) {
          // not JSON
        }
      } else if (err.response.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response.status === 403) {
        errorMsg = 'You do not have permission to export this dataset. Please contact an administrator.';
      } else if (err.response.status === 404) {
        errorMsg = 'No records found for the selected export filters.';
      }
    } else if (err.message) {
      errorMsg = err.message;
    }
    throw new Error(errorMsg);
  }
}

export const exportService = {
  exportCostingsExcel: (filters = {}) => {
    return handleBlobResponse(
      api.post('/exports/costings/excel', filters, {
        responseType: 'blob'
      }),
      `Grey-Costing-Export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  },

  exportCostingsCsv: (filters = {}) => {
    return handleBlobResponse(
      api.post('/exports/costings/csv', filters, {
        responseType: 'blob'
      }),
      `Grey-Costing-Export-${new Date().toISOString().slice(0, 10)}.csv`
    );
  },

  exportProductionExcel: (filters = {}) => {
    return handleBlobResponse(
      api.post('/exports/production/excel', filters, {
        responseType: 'blob'
      }),
      `Production-Planning-Export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  },

  exportYarnsExcel: (filters = {}) => {
    return handleBlobResponse(
      api.post('/exports/yarns/excel', filters, {
        responseType: 'blob'
      }),
      `Yarn-Master-Export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  },

  exportFabricsExcel: (filters = {}) => {
    return handleBlobResponse(
      api.post('/exports/fabrics/excel', filters, {
        responseType: 'blob'
      }),
      `Fabric-Master-Export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  },

  exportChargesExcel: (filters = {}) => {
    return handleBlobResponse(
      api.post('/exports/charges/excel', filters, {
        responseType: 'blob'
      }),
      `Process-Charges-Export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  },

  exportUsersExcel: (filters = {}) => {
    return handleBlobResponse(
      api.post('/exports/users/excel', filters, {
        responseType: 'blob'
      }),
      `User-Accounts-Export-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  },

  getCounts: async (type = 'costings', filters = {}) => {
    try {
      const res = await api.get('/exports/counts', {
        params: { type, ...filters }
      });
      return res.data?.count ?? 0;
    } catch (e) {
      console.error('Failed to get export counts:', e);
      return 0;
    }
  },

  getLogs: async (limit = 20) => {
    try {
      const res = await api.get('/exports/logs', {
        params: { limit }
      });
      return res.data?.data || [];
    } catch (e) {
      return [];
    }
  }
};

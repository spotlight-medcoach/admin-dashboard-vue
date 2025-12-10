export const state = () => ({
  manuals: undefined,
  loadingState: true,
  currentManual: undefined,
  totalManuals: 0,
  convertingManuals: {}, // Map of manualId -> conversion status
});

export const getters = {
  allManuals: (state) => state.manuals,
  loadingState: (state) => state.loadingState,
  currentManual: (state) => state.currentManual,
  totalManuals: (state) => state.totalManuals,
  convertingManuals: (state) => state.convertingManuals,
  getConversionStatus: (state) => (manualId) => {
    return state.convertingManuals[manualId] || null;
  },
};

export const mutations = {
  setLoadingState(state, loadingState) {
    state.loadingState = loadingState;
  },
  setManuals(state, manuals) {
    state.manuals = manuals;
  },
  setTotalManuals(state, total) {
    state.totalManuals = total;
  },
  addManual(state, manual) {
    if (!state.manuals) {
      state.manuals = [];
    }
    state.manuals.unshift(manual);
  },
  updateManualInList(state, updatedManual) {
    if (!state.manuals) return;
    const idx = state.manuals.findIndex(
      (manual) => manual._id === updatedManual._id
    );
    if (idx !== -1) {
      state.manuals.splice(idx, 1, updatedManual);
    }
  },
  removeManual(state, manualId) {
    if (!state.manuals) return;
    const idx = state.manuals.findIndex((manual) => manual._id === manualId);
    if (idx !== -1) {
      state.manuals.splice(idx, 1);
    }
  },
  setCurrentManual(state, manual) {
    state.currentManual = manual;
  },
  setConversionStatus(state, { manualId, status }) {
    state.convertingManuals = {
      ...state.convertingManuals,
      [manualId]: status,
    };
  },
  removeConversionStatus(state, manualId) {
    const newConvertingManuals = { ...state.convertingManuals };
    delete newConvertingManuals[manualId];
    state.convertingManuals = newConvertingManuals;
  },
  updateConversionStatus(state, { manualId, status, progress, error }) {
    state.convertingManuals = {
      ...state.convertingManuals,
      [manualId]: {
        ...state.convertingManuals[manualId],
        status,
        progress,
        error,
      },
    };
  },
};

export const actions = {
  fetchManuals({ commit }, params = {}) {
    commit('setLoadingState', true);
    return this.$axios
      .get('/manuals', { params })
      .then((response) => {
        const data = response.data;
        const manualsInfo = data.payload ||
          data.data || {
            manuals: [],
            total: 0,
          };
        const { manuals, total } = manualsInfo;
        commit('setManuals', manuals);
        commit('setTotalManuals', total);
        return manualsInfo;
      })
      .catch((error) => {
        console.error('Error fetching manuals:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
  fetchManualById({ commit }, manualId) {
    commit('setLoadingState', true);
    return this.$axios
      .get(`/manuals/${manualId}`)
      .then((response) => {
        const data = response.data;
        const manual = data.payload || data.data;
        commit('setCurrentManual', manual);
        return manual;
      })
      .catch((error) => {
        console.error('Error fetching manual:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
  async createManual({ commit }, manualData) {
    commit('setLoadingState', true);
    try {
      // Step 1: Obtener presigned URL para subir el documento
      const fileName = manualData.file.name;
      const contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      const presignedResponse = await this.$axios.post(
        '/manuals/presigned-url',
        {
          fileName,
          contentType,
        }
      );

      const { uploadUrl, fileUrl } =
        presignedResponse.data.data || presignedResponse.data;

      // Step 2: Subir archivo directamente a S3 usando la presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: manualData.file,
        headers: {
          'Content-Type': contentType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload document to S3');
      }

      // Step 3: Crear el manual con file_url y nuevos campos
      const response = await this.$axios.post('/manuals', {
        name: manualData.name,
        topic: manualData.topic_id,
        subtopic: manualData.subtopic_id,
        reading_time: manualData.reading_time,
        importance: manualData.importance,
        file_url: fileUrl,
      });

      const data = response.data;
      const newManual = data.payload || data.data || data;
      const manualId = newManual.id || newManual._id;

      // Step 4: Iniciar tracking de conversión si hay file_url
      if (fileUrl && manualId) {
        commit('setConversionStatus', {
          manualId,
          status: {
            status: 'pending',
            progress: 0,
            started_at: new Date().toISOString(),
          },
        });
      }

      commit('addManual', newManual);
      return newManual;
    } catch (error) {
      console.error('Error creating manual:', error);
      return error;
    } finally {
      commit('setLoadingState', false);
    }
  },
  async checkConversionStatus({ commit }, manualId) {
    try {
      const response = await this.$axios.get(
        `/manuals/${manualId}/conversion-status`
      );
      const status =
        response.data.payload || response.data.data || response.data;

      commit('updateConversionStatus', {
        manualId,
        status: status.status,
        progress: status.progress,
        error: status.error,
      });

      // Si la conversión está completa o falló, remover del tracking después de un tiempo
      if (status.status === 'completed' || status.status === 'failed') {
        // Mantener en el tracking por un tiempo para mostrar el estado final
        setTimeout(() => {
          commit('removeConversionStatus', manualId);
        }, 5000); // Remover después de 5 segundos
      }

      return status;
    } catch (error) {
      console.error('Error checking conversion status:', error);
      return null;
    }
  },
  startConversionTracking({ commit, dispatch }, manualId) {
    // Iniciar polling para este manual
    const intervalId = setInterval(async () => {
      const status = await dispatch('checkConversionStatus', manualId);
      if (
        status &&
        (status.status === 'completed' || status.status === 'failed')
      ) {
        clearInterval(intervalId);
      }
    }, 3000); // Verificar cada 3 segundos

    // Guardar el intervalId en el estado para poder limpiarlo después
    commit('setConversionStatus', {
      manualId,
      status: {
        status: 'pending',
        progress: 0,
        intervalId,
      },
    });
  },
  stopConversionTracking({ commit, state }, manualId) {
    const conversionStatus = state.convertingManuals[manualId];
    if (conversionStatus && conversionStatus.intervalId) {
      clearInterval(conversionStatus.intervalId);
    }
    commit('removeConversionStatus', manualId);
  },
  updateManual({ commit }, { manualId, manualData }) {
    commit('setLoadingState', true);
    return this.$axios
      .put(`/manuals/${manualId}`, manualData)
      .then((response) => {
        const data = response.data;
        const updatedManual = data.payload || data.data;
        commit('updateManualInList', updatedManual);
        commit('setCurrentManual', updatedManual);
        return updatedManual;
      })
      .catch((error) => {
        console.error('Error updating manual:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
  deleteManual({ commit }, manualId) {
    commit('setLoadingState', true);
    return this.$axios
      .delete(`/manuals/${manualId}`)
      .then((response) => {
        commit('removeManual', manualId);
        return response;
      })
      .catch((error) => {
        console.error('Error deleting manual:', error);
        return error;
      })
      .finally(() => {
        commit('setLoadingState', false);
      });
  },
};

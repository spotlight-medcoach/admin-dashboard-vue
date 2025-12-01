export const state = () => ({
  manuals: undefined,
  loadingState: true,
  currentManual: undefined,
  totalManuals: 0,
});

export const getters = {
  allManuals: (state) => state.manuals,
  loadingState: (state) => state.loadingState,
  currentManual: (state) => state.currentManual,
  totalManuals: (state) => state.totalManuals,
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
};

export const actions = {
  fetchManuals({ commit }, params = {}) {
    commit('setLoadingState', true);
    return this.$axios
      .get('/manuals', { params })
      .then((response) => {
        const data = response.data;
        const manuals = data.payload || data.data || [];
        const total = data.length || 0;
        commit('setManuals', manuals);
        commit('setTotalManuals', total);
        return { manuals, total };
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
      // Obtener presigned URL para subir el documento
      const presignedResponse = await this.$axios.post(
        '/manuals/upload-document',
        {
          name: manualData.name,
          topic_id: manualData.topic_id,
          subtopic_id: manualData.subtopic_id,
          fileExtension: 'docx',
        }
      );

      const { fileName, uploadUrl } = presignedResponse.data;

      // Subir archivo directamente a S3 usando la presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: manualData.file,
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload document to S3');
      }

      // Crear el manual con el nombre del archivo
      const response = await this.$axios.post('/manuals', {
        name: manualData.name,
        topic_id: manualData.topic_id,
        subtopic_id: manualData.subtopic_id,
        file_name: fileName,
      });

      const data = response.data;
      const newManual = data.payload || data.data;
      commit('addManual', newManual);
      return newManual;
    } catch (error) {
      console.error('Error creating manual:', error);
      return error;
    } finally {
      commit('setLoadingState', false);
    }
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

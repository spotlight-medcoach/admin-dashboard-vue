export const state = () => ({
  students: [],
  totalStudents: 0,
  currentPage: 1,
  limit: 20,
  loading: false,
  saving: false,
});

export const actions = {
  async fetchStudents({ commit }, params = {}) {
    try {
      commit('setLoading', true);
      const response = await this.$axios.get('/students', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          university: params.university,
          search: params.search,
        },
      });

      // El backend devuelve { success: true, data: [...], pagination: {...} }
      commit('setStudents', response.data.data || response.data.payload || []);
      commit(
        'setTotalStudents',
        (response.data.pagination && response.data.pagination.total) || 0
      );
      commit('setCurrentPage', params.page || 1);
    } catch (err) {
      console.error('Error fetching students:', err);
      if (this.$toastr) {
        this.$toastr.error('Error al cargar estudiantes', 'Error');
      }
    } finally {
      commit('setLoading', false);
    }
  },

  async createStudent({ commit, dispatch }, studentData) {
    try {
      commit('setSaving', true);
      await this.$axios.post('/students', studentData);
      if (this.$toastr) {
        this.$toastr.success('Estudiante creado exitosamente', 'Éxito');
      }
      await dispatch('fetchStudents');
    } catch (err) {
      console.error('Error creating student:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al crear estudiante';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async createStudentsBulk({ commit, dispatch }, csvContent) {
    try {
      commit('setSaving', true);
      const response = await this.$axios.post('/students/bulk', {
        csv_content: csvContent,
      });

      const { created, errors } = response.data.payload;
      if (created > 0 && this.$toastr) {
        this.$toastr.success(
          `${created} estudiante(s) creado(s) exitosamente`,
          'Éxito'
        );
      }
      if (errors && errors.length > 0 && this.$toastr) {
        this.$toastr.warning(
          `${errors.length} error(es) al crear estudiantes`,
          'Advertencia'
        );
      }
      await dispatch('fetchStudents');
      return { created, errors };
    } catch (err) {
      console.error('Error creating students bulk:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al crear estudiantes';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async updateStudent({ commit, dispatch }, { id, data }) {
    try {
      commit('setSaving', true);
      await this.$axios.put(`/students/${id}`, data);
      this.$toastr?.success('Estudiante actualizado exitosamente', 'Éxito');
      await dispatch('fetchStudents');
    } catch (err) {
      console.error('Error updating student:', err);
      const errorMessage =
        err.response?.data?.error || 'Error al actualizar estudiante';
      this.$toastr?.error(errorMessage, 'Error');
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async deleteStudent({ commit, dispatch }, id) {
    try {
      commit('setSaving', true);
      await this.$axios.delete(`/students/${id}`);
      if (this.$toastr) {
        this.$toastr.success('Estudiante eliminado exitosamente', 'Éxito');
      }
      await dispatch('fetchStudents');
    } catch (err) {
      console.error('Error deleting student:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al eliminar estudiante';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async resendWelcomeEmail({ commit }, id) {
    try {
      commit('setSaving', true);
      await this.$axios.post(`/students/${id}/resend-welcome-email`);
      if (this.$toastr) {
        this.$toastr.success(
          'Correo de bienvenida reenviado exitosamente',
          'Éxito'
        );
      }
    } catch (err) {
      console.error('Error resending welcome email:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al reenviar correo de bienvenida';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async generateDiagnosticTest({ commit }, id) {
    try {
      commit('setSaving', true);
      await this.$axios.post(`/students/${id}/generate-diagnostic-test`);
      if (this.$toastr) {
        this.$toastr.success(
          'Generación de examen de diagnóstico encolada exitosamente',
          'Éxito'
        );
      }
    } catch (err) {
      console.error('Error generating diagnostic test:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al generar examen de diagnóstico';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },
};

export const getters = {
  getStudents(state) {
    return state.students;
  },
  getTotalStudents(state) {
    return state.totalStudents;
  },
  getCurrentPage(state) {
    return state.currentPage;
  },
  isLoading(state) {
    return state.loading;
  },
  isSaving(state) {
    return state.saving;
  },
};

export const mutations = {
  setStudents(state, students) {
    state.students = students;
  },
  setTotalStudents(state, total) {
    state.totalStudents = total;
  },
  setCurrentPage(state, page) {
    state.currentPage = page;
  },
  setLoading(state, loading) {
    state.loading = loading;
  },
  setSaving(state, saving) {
    state.saving = saving;
  },
};

export const state = () => ({
  students: [],
  totalStudents: 0,
  currentPage: 1,
  limit: 20,
  loading: false,
  saving: false,
  emailQueueStatus: {
    pending: 0,
    sent: 0,
    failed: 0,
    total: 0,
  },
  studentStats: {
    total: 0,
    completed: 0,
    pending: 0,
  },
  studentDetail: null,
});

export const actions = {
  async fetchStudents({ commit }, params = {}) {
    try {
      commit('setLoading', true);
      const requestParams = {
        page: params.page || 1,
        limit: params.limit || 20,
        university: params.university,
        search: params.search,
      };

      // Add new filter parameters
      if (params.exam_year !== undefined) {
        requestParams.exam_year = params.exam_year;
      }
      if (params.profile_completed !== undefined) {
        requestParams.profile_completed = params.profile_completed;
      }
      if (params.search_phone) {
        requestParams.search_phone = params.search_phone;
      }
      if (params.search_student_id) {
        requestParams.search_student_id = params.search_student_id;
      }

      const response = await this.$axios.get('/students', {
        params: requestParams,
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

  async createStudentsBulk(
    { commit, dispatch },
    { csvContent, sendEmails = false }
  ) {
    try {
      commit('setSaving', true);
      const response = await this.$axios.post('/students/bulk', {
        csv_content: csvContent,
        send_emails: sendEmails,
      });

      const { created, errors } =
        response.data.data || response.data.payload || response.data;
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
      const response = await this.$axios.post(
        `/students/${id}/resend-welcome-email`
      );
      const result = response.data.payload || response.data.data || {};
      if (this.$toastr) {
        let message = 'Correo de bienvenida reenviado exitosamente';
        if (result.pending_job_completed) {
          message += ' (job pendiente completado)';
        }
        this.$toastr.success(message, 'Éxito');
      }
      return result;
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

  async regenerateSyllabus({ commit, dispatch }, id) {
    try {
      commit('setSaving', true);
      await this.$axios.post(`/students/${id}/regenerate-syllabus`);
      if (this.$toastr) {
        this.$toastr.success(
          'Regeneración de plan de estudios iniciada',
          'Éxito'
        );
      }
      // Actualizar la lista de estudiantes para reflejar el nuevo estado
      await dispatch('fetchStudents');
    } catch (err) {
      console.error('Error regenerating syllabus:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al regenerar plan de estudios';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  // eslint-disable-next-line no-unused-vars
  async getSyllabusRegenerationStatus({ commit }, id) {
    try {
      const response = await this.$axios.get(
        `/students/${id}/syllabus-regeneration-status`
      );
      return (
        response.data.payload?.status || response.data.data?.status || 'idle'
      );
    } catch (err) {
      console.error('Error getting syllabus regeneration status:', err);
      return 'idle';
    }
  },

  async initializeStudentProgress({ commit }, id) {
    try {
      commit('setSaving', true);
      await this.$axios.post(`/students/${id}/initialize-progress`);
      if (this.$toastr) {
        this.$toastr.success(
          'Progreso del estudiante inicializado exitosamente',
          'Éxito'
        );
      }
    } catch (err) {
      console.error('Error initializing student progress:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al inicializar progreso del estudiante';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async updateTestDate({ commit, dispatch }, { studentId, testDate }) {
    try {
      commit('setSaving', true);
      const response = await this.$axios.patch(
        `/students/${studentId}/test-date`,
        { test_date: testDate }
      );
      const student = response.data.payload || response.data.data;
      await dispatch('fetchStudents');
      return student;
    } catch (err) {
      console.error('Error updating test date:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al actualizar fecha de examen';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async sendBulkWelcomeEmails({ commit, dispatch }, filters = undefined) {
    try {
      commit('setSaving', true);
      const response = await this.$axios.post(
        '/students/send-bulk-welcome-emails',
        filters || {}
      );
      const { queued, batch_id } =
        response.data.payload || response.data.data || {};
      if (this.$toastr) {
        this.$toastr.success(
          `${queued} correo(s) encolado(s) exitosamente`,
          'Éxito'
        );
      }
      // Refresh email queue status
      await dispatch('getEmailQueueStatus');
      return { queued, batch_id };
    } catch (err) {
      console.error('Error sending bulk welcome emails:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al enviar correos masivos';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async getEmailQueueStatus({ commit }) {
    try {
      const response = await this.$axios.get('/students/email-queue-status');
      const status = response.data.payload ||
        response.data.data || {
          pending: 0,
          sent: 0,
          failed: 0,
          total: 0,
        };
      commit('setEmailQueueStatus', status);
      return status;
    } catch (err) {
      console.error('Error getting email queue status:', err);
      return {
        pending: 0,
        sent: 0,
        failed: 0,
        total: 0,
      };
    }
  },

  async fetchStudentDetail({ commit }, studentId) {
    try {
      commit('setLoading', true);
      const response = await this.$axios.get(
        `/students/${studentId}/detail`
      );
      const detail =
        response.data.payload || response.data.data || response.data;
      commit('setStudentDetail', detail);
      return detail;
    } catch (err) {
      console.error('Error fetching student detail:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al cargar detalle del estudiante';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setLoading', false);
    }
  },

  async recalculateMedScore({ commit }, id) {
    try {
      commit('setSaving', true);
      const response = await this.$axios.post(
        `/students/${id}/recalculate-medscore`
      );
      return response.data.payload || response.data.data;
    } catch (err) {
      console.error('Error recalculating medscore:', err);
      const errorMessage =
        (err.response && err.response.data && err.response.data.error) ||
        'Error al recalcular MedScore';
      if (this.$toastr) {
        this.$toastr.error(errorMessage, 'Error');
      }
      throw err;
    } finally {
      commit('setSaving', false);
    }
  },

  async fetchStudentStats({ commit }) {
    try {
      const response = await this.$axios.get('/students/stats');
      const stats = response.data.payload ||
        response.data.data ||
        response.data || {
          total: 0,
          completed: 0,
          pending: 0,
        };
      commit('setStudentStats', stats);
      return stats;
    } catch (err) {
      console.error('Error fetching student stats:', err);
      const defaultStats = {
        total: 0,
        completed: 0,
        pending: 0,
      };
      commit('setStudentStats', defaultStats);
      return defaultStats;
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
  getEmailQueueStatus(state) {
    return state.emailQueueStatus;
  },
  getStudentStats(state) {
    return state.studentStats;
  },
  getStudentDetail(state) {
    return state.studentDetail;
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
  setEmailQueueStatus(state, status) {
    state.emailQueueStatus = status;
  },
  setStudentStats(state, stats) {
    state.studentStats = stats;
  },
  setStudentDetail(state, detail) {
    state.studentDetail = detail;
  },
};

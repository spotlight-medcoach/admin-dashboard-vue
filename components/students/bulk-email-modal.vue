<template>
  <b-modal
    id="bulk-email-modal"
    v-model="showModal"
    title="Enviar Correos Masivos"
    size="lg"
    @hidden="resetForm"
  >
    <div class="bulk-email-form">
      <p class="description">
        Selecciona los filtros para determinar qué estudiantes recibirán el correo
        de bienvenida.
      </p>

      <!-- Filtros -->
      <b-form-group label="Universidad" label-for="filter-university">
        <b-form-select
          id="filter-university"
          v-model="filters.university"
          :options="universityOptions"
          :disabled="universities.length === 0"
        >
          <option :value="null">Todas las universidades</option>
        </b-form-select>
        <small v-if="universities.length === 0" class="form-text text-muted">
          Cargando universidades...
        </small>
      </b-form-group>

      <b-form-group label="Año de examen" label-for="filter-exam-year">
        <b-form-select
          id="filter-exam-year"
          v-model="filters.exam_year"
          :options="examYearOptions"
        >
          <option :value="null">Todos los años</option>
        </b-form-select>
      </b-form-group>

      <b-form-group
        label="Estado de registro"
        label-for="filter-profile-status"
      >
        <b-form-select
          id="filter-profile-status"
          v-model="filters.profile_completed"
          :options="profileStatusOptions"
        >
          <option :value="null">Todos</option>
        </b-form-select>
      </b-form-group>

      <b-form-group label="Fecha de creación desde" label-for="filter-created-from">
        <b-form-input
          id="filter-created-from"
          v-model="filters.created_from"
          type="date"
        />
      </b-form-group>

      <b-form-group label="Fecha de creación hasta" label-for="filter-created-to">
        <b-form-input
          id="filter-created-to"
          v-model="filters.created_to"
          type="date"
        />
      </b-form-group>

      <!-- Preview de destinatarios -->
      <div v-if="previewCount !== null" class="preview-section">
        <div class="preview-card">
          <div class="preview-header">
            <i class="fas fa-users"></i>
            <span>Estudiantes que recibirán el correo</span>
          </div>
          <div class="preview-count">
            <span class="count-number">{{ previewCount }}</span>
            <span class="count-label">estudiante(s)</span>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
    </div>

    <template #modal-footer>
      <b-button variant="secondary" @click="closeModal"> Cancelar </b-button>
      <b-button
        variant="primary"
        :disabled="loading || previewCount === null || previewCount === 0"
        @click="sendEmails"
      >
        <span v-if="loading">Enviando...</span>
        <span v-else>Enviar Correos</span>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'BulkEmailModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    universities: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['close', 'send'],
  data() {
    return {
      showModal: this.show,
      filters: {
        university: null,
        exam_year: null,
        profile_completed: null,
        created_from: null,
        created_to: null,
      },
      previewCount: null,
      loading: false,
      error: null,
      previewTimeout: null,
    };
  },
  computed: {
    universityOptions() {
      return this.universities.map((u) => ({
        value: u._id,
        text: u.name,
      }));
    },
    examYearOptions() {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = 2020; year <= currentYear + 5; year++) {
        years.push({
          value: year,
          text: year.toString(),
        });
      }
      return years.reverse();
    },
    profileStatusOptions() {
      return [
        { value: false, text: 'Pendiente' },
        { value: true, text: 'Registro completo' },
      ];
    },
  },
  watch: {
    show(newVal) {
      this.showModal = newVal;
      if (newVal) {
        this.loadPreview();
      }
    },
    showModal(newVal) {
      if (!newVal) {
        this.$emit('close');
      }
    },
    filters: {
      handler() {
        this.debouncePreview();
      },
      deep: true,
    },
  },
  methods: {
    async loadPreview() {
      try {
        // Construir query params para el preview
        const params = this.buildPreviewParams();
        const response = await this.$axios.get('/students', {
          params: {
            ...params,
            limit: 1, // Solo necesitamos el total
          },
        });

        // Obtener el total de la respuesta paginada
        const total =
          response.data.pagination?.total ||
          response.data.data?.length ||
          0;
        this.previewCount = total;
        this.error = null;
      } catch (err) {
        console.error('Error loading preview:', err);
        this.error = 'Error al calcular el número de destinatarios';
        this.previewCount = null;
      }
    },
    buildPreviewParams() {
      const params = {};
      if (this.filters.university) {
        params.university = this.filters.university;
      }
      if (this.filters.exam_year) {
        params.exam_year = this.filters.exam_year;
      }
      if (this.filters.profile_completed !== null) {
        params.profile_completed = this.filters.profile_completed;
      }
      if (this.filters.created_from) {
        params.created_from = this.filters.created_from;
      }
      if (this.filters.created_to) {
        params.created_to = this.filters.created_to;
      }
      // Solo estudiantes con token de registro y no usado
      return params;
    },
    debouncePreview() {
      if (this.previewTimeout) {
        clearTimeout(this.previewTimeout);
      }
      this.previewTimeout = setTimeout(() => {
        this.loadPreview();
      }, 500);
    },
    async sendEmails() {
      this.loading = true;
      this.error = null;

      try {
        const filters = this.buildFilters();
        await this.$store.dispatch('students/sendBulkWelcomeEmails', filters);
        this.$emit('send', filters);
        this.closeModal();
        this.$bvToast.toast('Correos encolados exitosamente', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
      } catch (err) {
        console.error('Error sending bulk emails:', err);
        this.error =
          err.response?.data?.error ||
          'Error al enviar correos masivos. Por favor, intenta de nuevo.';
      } finally {
        this.loading = false;
      }
    },
    buildFilters() {
      const filters = {};
      if (this.filters.university) {
        filters.university = this.filters.university;
      }
      if (this.filters.exam_year) {
        filters.exam_year = this.filters.exam_year;
      }
      if (this.filters.profile_completed !== null) {
        filters.profile_completed = this.filters.profile_completed;
      }
      if (this.filters.created_from) {
        filters.created_from = this.filters.created_from;
      }
      if (this.filters.created_to) {
        filters.created_to = this.filters.created_to;
      }
      return Object.keys(filters).length > 0 ? filters : undefined;
    },
    closeModal() {
      this.showModal = false;
      this.resetForm();
    },
    resetForm() {
      this.filters = {
        university: null,
        exam_year: null,
        profile_completed: null,
        created_from: null,
        created_to: null,
      };
      this.previewCount = null;
      this.error = null;
      if (this.previewTimeout) {
        clearTimeout(this.previewTimeout);
      }
    },
  },
  beforeDestroy() {
    if (this.previewTimeout) {
      clearTimeout(this.previewTimeout);
    }
  },
};
</script>

<style lang="scss" scoped>
.bulk-email-form {
  .description {
    color: #666;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .preview-section {
    margin-top: 20px;
    margin-bottom: 10px;

    .preview-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      border: 1px solid #e0e0e0;

      .preview-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        color: #333;
        font-weight: 600;
        font-size: 14px;

        i {
          color: #1ca4fc;
        }
      }

      .preview-count {
        display: flex;
        align-items: baseline;
        gap: 8px;

        .count-number {
          font-size: 32px;
          font-weight: 700;
          color: #1ca4fc;
        }

        .count-label {
          font-size: 16px;
          color: #666;
        }
      }
    }
  }
}
</style>

<template>
  <div id="students">
    <section class="students-container">
      <article class="full">
        <template>
          <data-table-container
            :data="students"
            :columns="tableColumns"
            :loading="loadingState"
            :show-full-loader="isInitialLoad"
            loading-message="Estamos obteniendo los estudiantes"
            :search="search"
            search-placeholder="Buscar por nombre o email"
            :filters="tableFilters"
            :filter-values="filterValues"
            :current-page="page"
            :page-results="pageResults"
            :total="totalStudents"
            total-label="estudiantes"
            :page-size-options="[10, 20, 50, 100]"
            empty-message="No hay estudiantes disponibles"
            :advanced="true"
            :sortable="['name', 'email', 'exam_year']"
            :default-sort="{ key: 'name', order: 'asc' }"
            :fixed-columns="['actions']"
            @update:search="handleSearchUpdate"
            @search="searchStudents"
            @filter-change="handleFilterChange"
            @page-change="handlePageChange"
            @page-results-change="handlePageResultsChange"
            @sort-change="handleSortChange"
          >
            <template #cell-name="{ row }">
              {{ row.name }} {{ row.last_name }}
            </template>
            <template #cell-university="{ row }">
              {{ (row.university && row.university.name) || '-' }}
            </template>
            <template #cell-status="{ row }">
              <div class="status-container">
                <span
                  :class="
                    row.profile_completed
                      ? 'badge badge-success'
                      : 'badge badge-warning'
                  "
                >
                  {{
                    row.profile_completed ? 'Registro completo' : 'Pendiente'
                  }}
                </span>
                <span
                  :class="
                    getSyllabusStatusClass(row.syllabus_regeneration_status)
                  "
                  class="ml-2"
                >
                  {{ getSyllabusStatusText(row.syllabus_regeneration_status) }}
                </span>
              </div>
            </template>
            <template #cell-actions="{ row }">
              <div class="td-actions">
                <b-dropdown
                  variant="link"
                  toggle-class="text-decoration-none"
                  no-caret
                  right
                >
                  <template #button-content>
                    <i class="fas fa-ellipsis-v"></i>
                  </template>
                  <b-dropdown-item @click="resendWelcomeEmail(row._id)">
                    <i class="fas fa-envelope"></i> Reenviar correo
                  </b-dropdown-item>
                  <b-dropdown-item @click="generateDiagnosticTest(row._id)">
                    <i class="fas fa-file-medical"></i> Generar examen de
                    diagnóstico
                  </b-dropdown-item>
                  <b-dropdown-item @click="regenerateSyllabus(row._id)">
                    <i class="fas fa-sync-alt"></i> Regenerar plan de estudios
                  </b-dropdown-item>
                  <b-dropdown-item @click="initializeStudentProgress(row._id)">
                    <i class="fas fa-redo"></i> Inicializar progreso
                  </b-dropdown-item>
                  <b-dropdown-item @click="editStudent(row)">
                    <i class="fas fa-pencil-alt"></i> Editar
                  </b-dropdown-item>
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-item
                    @click="deleteQuestionConfirm(row._id)"
                    class="text-danger"
                  >
                    <i class="fas fa-trash"></i> Eliminar
                  </b-dropdown-item>
                </b-dropdown>
              </div>
            </template>
          </data-table-container>
        </template>
      </article>
    </section>

    <!-- Manual Student Modal -->
    <b-modal
      id="manual-student-modal"
      v-model="showManualModal"
      title="Agregar Estudiante"
      size="lg"
      @hidden="resetManualForm"
    >
      <b-form @submit.prevent="createStudent">
        <b-form-group label="Nombre(s)" label-for="name">
          <b-form-input
            id="name"
            v-model="manualForm.name"
            required
            placeholder="Nombre(s)"
          />
        </b-form-group>

        <b-form-group label="Apellidos" label-for="last_name">
          <b-form-input
            id="last_name"
            v-model="manualForm.last_name"
            required
            placeholder="Apellidos"
          />
        </b-form-group>

        <b-form-group label="Email" label-for="email">
          <b-form-input
            id="email"
            v-model="manualForm.email"
            type="email"
            required
            placeholder="correo@ejemplo.com"
          />
        </b-form-group>

        <b-form-group label="Teléfono" label-for="phone">
          <b-form-input
            id="phone"
            v-model="manualForm.phone"
            required
            placeholder="Teléfono"
          />
        </b-form-group>

        <b-form-group label="Universidad" label-for="university">
          <b-form-select
            id="university"
            v-model="manualForm.university"
            :options="universityOptions"
            :disabled="universities.length === 0"
            required
          />
          <small v-if="universities.length === 0" class="form-text text-muted">
            Cargando universidades...
          </small>
        </b-form-group>

        <b-form-group label="Año de examen" label-for="exam_year">
          <b-form-input
            id="exam_year"
            v-model="manualForm.exam_year"
            type="number"
            :min="new Date().getFullYear()"
            required
            placeholder="2024"
          />
        </b-form-group>
      </b-form>

      <template #modal-footer>
        <b-button variant="secondary" @click="showManualModal = false">
          Cancelar
        </b-button>
        <b-button variant="primary" :disabled="saving" @click="createStudent">
          <span v-if="saving">Guardando...</span>
          <span v-else>Guardar</span>
        </b-button>
      </template>
    </b-modal>

    <!-- CSV Upload Modal -->
    <b-modal
      id="csv-upload-modal"
      v-model="showCSVModal"
      title="Cargar Estudiantes desde CSV"
      size="lg"
      @hidden="resetCSVForm"
    >
      <b-form-group
        label="Archivo CSV"
        label-for="csv-file"
        description="El archivo debe tener las columnas: nombre(s), apellidos, universidad, fecha de examen"
      >
        <b-form-file
          id="csv-file"
          v-model="csvFile"
          accept=".csv"
          @change="handleCSVFile"
        />
      </b-form-group>

      <div v-if="csvPreview.length > 0" class="csv-preview">
        <h6>Vista previa (primeras 5 filas):</h6>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Nombre(s)</th>
              <th>Apellidos</th>
              <th>Universidad</th>
              <th>Fecha de examen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in csvPreview.slice(0, 5)" :key="index">
              <td>{{ row.name }}</td>
              <td>{{ row.last_name }}</td>
              <td>{{ row.university }}</td>
              <td>{{ row.exam_year }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #modal-footer>
        <b-button variant="secondary" @click="showCSVModal = false">
          Cancelar
        </b-button>
        <b-button
          variant="primary"
          :disabled="!csvContent || saving"
          @click="uploadCSV"
        >
          <span v-if="saving">Cargando...</span>
          <span v-else>Cargar CSV</span>
        </b-button>
      </template>
    </b-modal>

    <!-- Delete Confirmation Modal -->
    <b-modal
      id="delete-student-modal"
      v-model="showDeleteModal"
      title="Eliminar Estudiante"
      @ok="deleteStudent"
    >
      <p>
        ¿Estás seguro de que deseas eliminar a
        <strong
          >{{ studentToDelete && studentToDelete.name }}
          {{ studentToDelete && studentToDelete.last_name }}</strong
        >?
      </p>
      <p class="text-danger">Esta acción no se puede deshacer.</p>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import DataTableContainer from '@/components/tables/data-table-container.vue';

export default {
  components: {
    DataTableContainer,
  },
  data() {
    return {
      page: 1,
      pageResults: 20,
      search: '',
      selectedUniversity: '',
      isInitialLoad: true,
      showManualModal: false,
      showCSVModal: false,
      showDeleteModal: false,
      studentToDelete: null,
      saving: false,
      universities: [],
      sortBy: 'name',
      sortOrder: 'asc',
      manualForm: {
        name: '',
        last_name: '',
        email: '',
        phone: '',
        university: '',
        exam_year: new Date().getFullYear(),
      },
      csvFile: null,
      csvContent: '',
      csvPreview: [],
      syllabusStatusPolling: {},
    };
  },
  computed: {
    ...mapGetters('students', [
      'getStudents',
      'getTotalStudents',
      'isLoading',
      'isSaving',
    ]),
    students() {
      return this.getStudents;
    },
    totalStudents() {
      return this.getTotalStudents;
    },
    loadingState() {
      return this.isLoading;
    },
    filterValues() {
      return {
        university: this.selectedUniversity,
      };
    },
    tableFilters() {
      return [
        {
          key: 'university',
          label: 'Universidad',
          placeholder: 'Todas las universidades',
          defaultValue: '',
          options: this.universityFilterOptions,
        },
      ];
    },
    universityOptions() {
      const options = [
        {
          value: '',
          text: '-- Selecciona una universidad',
          disabled: true,
        },
      ];
      return options.concat(
        this.universities.map((u) => ({
          value: u._id,
          text: u.name,
        }))
      );
    },
    universityFilterOptions() {
      return this.universities.map((u) => ({
        id: u._id,
        name: u.name,
      }));
    },
    tableColumns() {
      return [
        {
          key: 'name',
          label: 'Nombre completo',
          scope: 'col',
          width: 250,
        },
        {
          key: 'email',
          label: 'Email',
          scope: 'col',
          width: 250,
        },
        {
          key: 'phone',
          label: 'Teléfono',
          scope: 'col',
          width: 150,
          value: (row) => row.phone || '-',
        },
        {
          key: 'university',
          label: 'Universidad',
          scope: 'col',
          width: 300,
        },
        {
          key: 'exam_year',
          label: 'Año de examen',
          scope: 'col',
          width: 120,
          value: (row) => row.exam_year || '-',
        },
        {
          key: 'status',
          label: 'Estado',
          scope: 'col',
          width: 250,
        },
        {
          key: 'actions',
          label: 'Acciones',
          scope: 'col',
          width: 120,
        },
      ];
    },
  },
  methods: {
    async fetchUniversities() {
      try {
        const response = await this.$axios.get('/universities');
        // El endpoint devuelve { success: true, data: [...] }
        this.universities = response.data.data || response.data.payload || [];
        console.log('Universities loaded:', this.universities.length);
      } catch (error) {
        console.error('Error fetching universities:', error);
        if (error.response) {
          console.error('Response data:', error.response.data);
        }
      }
    },
    async loadStudents() {
      try {
        const params = {
          page: this.page,
          limit: this.pageResults,
        };

        if (this.search && this.search.trim() !== '') {
          params.search = this.search.trim();
        }

        if (this.selectedUniversity && this.selectedUniversity.trim() !== '') {
          params.university = this.selectedUniversity.trim();
        }

        await this.$store.dispatch('students/fetchStudents', params);
        // Iniciar polling para estudiantes con estado pending después de cargar
        this.startPollingForPendingStudents();
      } catch (err) {
        console.error('Error getting students:', err);
      }
    },
    handleSortChange(sortInfo) {
      this.sortBy = sortInfo.key;
      this.sortOrder = sortInfo.order;
      this.page = 1;
      this.loadStudents();
    },
    handleSearchUpdate(value) {
      this.search = value;
    },
    searchStudents() {
      this.page = 1;
      this.loadStudents();
    },
    handleFilterChange({ key, value }) {
      if (key === 'university') {
        this.selectedUniversity = value;
        this.page = 1;
        this.loadStudents();
      }
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.loadStudents();
    },
    handlePageResultsChange(newPageResults) {
      this.pageResults = newPageResults;
      this.page = 1;
      this.loadStudents();
    },
    async handleHeaderButtonClick(action) {
      if (action === 'addStudent') {
        // Asegurar que las universidades estén cargadas antes de abrir el modal
        if (this.universities.length === 0) {
          await this.fetchUniversities();
        }
        this.showManualModal = true;
      } else if (action === 'uploadCSV') {
        this.showCSVModal = true;
      }
    },
    async createStudent() {
      this.saving = true;
      try {
        await this.$store.dispatch('students/createStudent', this.manualForm);
        this.showManualModal = false;
        this.resetManualForm();
        await this.loadStudents();
        this.$bvToast.toast('Estudiante creado exitosamente', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Error creating student:', error);
        this.$bvToast.toast('Error al crear estudiante', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },
    resetManualForm() {
      this.manualForm = {
        name: '',
        last_name: '',
        email: '',
        phone: '',
        university: '',
        exam_year: new Date().getFullYear(),
      };
    },
    handleCSVFile(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.csvContent = e.target.result;
        this.parseCSVPreview(this.csvContent);
      };
      reader.readAsText(file);
    },
    parseCSVPreview(content) {
      const lines = content.split('\n').filter((line) => line.trim());
      if (lines.length < 2) return;

      const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const nameIndex = header.indexOf('nombre(s)');
      const lastNameIndex = header.indexOf('apellidos');
      const universityIndex = header.indexOf('universidad');
      const examDateIndex = header.indexOf('fecha de examen');

      this.csvPreview = [];
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        if (values.length < 4) continue;

        let exam_year = new Date().getFullYear();
        const examDate = values[examDateIndex] || '';
        if (examDate.match(/^\d{4}$/)) {
          exam_year = parseInt(examDate, 10);
        } else if (examDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          exam_year = parseInt(examDate.split('-')[0], 10);
        }

        this.csvPreview.push({
          name: values[nameIndex] || '',
          last_name: values[lastNameIndex] || '',
          university: values[universityIndex] || '',
          exam_year,
        });
      }
    },
    async uploadCSV() {
      if (!this.csvContent) return;

      this.saving = true;
      try {
        const result = await this.$store.dispatch(
          'students/createStudentsBulk',
          this.csvContent
        );
        this.showCSVModal = false;
        this.resetCSVForm();
        await this.loadStudents();
        this.$bvToast.toast(
          `${result.created} estudiante(s) creado(s) exitosamente`,
          {
            title: 'Éxito',
            variant: 'success',
            solid: true,
          }
        );
        if (result.errors && result.errors.length > 0) {
          this.$bvToast.toast(
            `${result.errors.length} error(es) al crear estudiantes`,
            {
              title: 'Advertencia',
              variant: 'warning',
              solid: true,
            }
          );
        }
      } catch (error) {
        console.error('Error uploading CSV:', error);
        this.$bvToast.toast('Error al cargar estudiantes desde CSV', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.saving = false;
      }
    },
    resetCSVForm() {
      this.csvFile = null;
      this.csvContent = '';
      this.csvPreview = [];
    },
    // eslint-disable-next-line no-unused-vars
    editStudent(student) {
      // TODO: Implement edit functionality
      this.$bvToast.toast('Funcionalidad de edición próximamente', {
        title: 'Info',
        variant: 'info',
        solid: true,
      });
    },
    deleteQuestionConfirm(studentId) {
      const student = this.students.find((s) => s._id === studentId);
      if (student) {
        this.studentToDelete = student;
        this.showDeleteModal = true;
      }
    },
    async deleteStudent() {
      if (!this.studentToDelete) return;

      try {
        await this.$store.dispatch(
          'students/deleteStudent',
          this.studentToDelete._id
        );
        this.showDeleteModal = false;
        this.studentToDelete = null;
        await this.loadStudents();
        this.$bvToast.toast('Estudiante eliminado exitosamente', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Error deleting student:', error);
        this.$bvToast.toast('Error al eliminar estudiante', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    async resendWelcomeEmail(studentId) {
      try {
        await this.$store.dispatch('students/resendWelcomeEmail', studentId);
        this.$bvToast.toast('Correo de bienvenida reenviado exitosamente', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Error resending welcome email:', error);
        this.$bvToast.toast('Error al reenviar correo de bienvenida', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    async generateDiagnosticTest(studentId) {
      try {
        await this.$store.dispatch(
          'students/generateDiagnosticTest',
          studentId
        );
        this.$bvToast.toast(
          'Generación de examen de diagnóstico encolada exitosamente',
          {
            title: 'Éxito',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error('Error generating diagnostic test:', error);
        this.$bvToast.toast('Error al generar examen de diagnóstico', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    async regenerateSyllabus(studentId) {
      try {
        await this.$store.dispatch('students/regenerateSyllabus', studentId);
        this.$bvToast.toast('Regeneración de plan de estudios iniciada', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
        // Recargar estudiantes para actualizar el estado
        await this.loadStudents();
        // Iniciar polling del estado si está en pending
        this.startSyllabusStatusPolling(studentId);
      } catch (error) {
        console.error('Error regenerating syllabus:', error);
        this.$bvToast.toast('Error al regenerar plan de estudios', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    async initializeStudentProgress(studentId) {
      try {
        await this.$store.dispatch(
          'students/initializeStudentProgress',
          studentId
        );
        this.$bvToast.toast(
          'Progreso del estudiante inicializado exitosamente',
          {
            title: 'Éxito',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error('Error initializing student progress:', error);
        this.$bvToast.toast('Error al inicializar progreso del estudiante', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    getSyllabusStatusText(status) {
      const statusMap = {
        idle: 'Sin regenerar',
        pending: 'Regenerando...',
        completed: 'Completado',
        failed: 'Error',
      };
      return statusMap[status] || 'Desconocido';
    },
    getSyllabusStatusClass(status) {
      const classMap = {
        idle: 'badge badge-secondary',
        pending: 'badge badge-info',
        completed: 'badge badge-success',
        failed: 'badge badge-danger',
      };
      return classMap[status] || 'badge badge-secondary';
    },
    async startSyllabusStatusPolling(studentId) {
      // Limpiar polling anterior si existe
      if (this.syllabusStatusPolling[studentId]) {
        clearInterval(this.syllabusStatusPolling[studentId]);
      }

      // Polling cada 3 segundos
      this.syllabusStatusPolling[studentId] = setInterval(async () => {
        try {
          const status = await this.$store.dispatch(
            'students/getSyllabusRegenerationStatus',
            studentId
          );

          // Si el estado cambió a completed o failed, detener el polling
          if (status === 'completed' || status === 'failed') {
            clearInterval(this.syllabusStatusPolling[studentId]);
            delete this.syllabusStatusPolling[studentId];
            // Recargar estudiantes para actualizar la tabla
            await this.loadStudents();

            if (status === 'completed') {
              this.$bvToast.toast('Plan de estudios regenerado exitosamente', {
                title: 'Éxito',
                variant: 'success',
                solid: true,
              });
            } else if (status === 'failed') {
              this.$bvToast.toast('Error al regenerar plan de estudios', {
                title: 'Error',
                variant: 'danger',
                solid: true,
              });
            }
          }
        } catch (error) {
          console.error('Error polling syllabus status:', error);
          // Detener polling en caso de error
          clearInterval(this.syllabusStatusPolling[studentId]);
          delete this.syllabusStatusPolling[studentId];
        }
      }, 3000);
    },
    startPollingForPendingStudents() {
      // Buscar estudiantes con estado pending y iniciar polling
      this.students.forEach((student) => {
        if (student.syllabus_regeneration_status === 'pending') {
          this.startSyllabusStatusPolling(student._id);
        }
      });
    },
  },
  async created() {
    if (process.browser) {
      await this.fetchUniversities();
    }
  },
  async mounted() {
    this.$store.dispatch('pageHeader/setHeader', {
      title: 'Estudiantes',
      buttonConfig: {
        type: 'dropdown',
        text: 'Agregar estudiante',
        icon: 'fas fa-user-plus',
        items: [
          {
            text: 'Agregar estudiante',
            action: 'addStudent',
            icon: 'fas fa-user-plus',
          },
          {
            text: 'Cargar desde CSV',
            action: 'uploadCSV',
            icon: 'fas fa-file-csv',
          },
        ],
      },
    });

    this.$nuxt.$on('page-header-button-click', this.handleHeaderButtonClick);

    await this.loadStudents();
    this.isInitialLoad = false;
    // Iniciar polling para estudiantes con estado pending
    this.startPollingForPendingStudents();
  },
  beforeDestroy() {
    // Limpiar todos los intervalos de polling
    Object.keys(this.syllabusStatusPolling).forEach((studentId) => {
      clearInterval(this.syllabusStatusPolling[studentId]);
    });
    this.syllabusStatusPolling = {};

    this.$store.dispatch('pageHeader/clearHeader');
    this.$nuxt.$off('page-header-button-click', this.handleHeaderButtonClick);
  },
};
</script>

<style lang="scss" scoped>
#students {
  .td-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    position: relative;
    z-index: 1;
  }

  .td-actions ::v-deep .btn-link {
    color: #6c757d;
    padding: 4px 8px;
    border: none;
    background: transparent;
    font-size: 16px;
    position: relative;
    z-index: 1;

    &:hover {
      color: #495057;
    }

    &:focus {
      box-shadow: none;
    }
  }

  .td-actions ::v-deep .dropdown {
    position: relative;
    z-index: 100;
  }

  .td-actions ::v-deep .dropdown-menu {
    min-width: 220px;
    padding: 8px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    z-index: 9999 !important;
    position: absolute !important;
    margin-top: 0 !important;
    // Asegurar que esté por encima del header (z-index: 25)
  }

  // Asegurar que el dropdown aparezca sobre otras filas y el header
  .td-actions ::v-deep .show > .dropdown-menu {
    display: block !important;
    z-index: 9999 !important;
  }

  // Asegurar que el botón del dropdown también tenga z-index alto cuando está abierto
  .td-actions ::v-deep .dropdown.show {
    z-index: 100;
    position: relative;
  }

  // Asegurar que la celda de acciones tenga un z-index alto cuando el dropdown está abierto
  .td-actions ::v-deep .dropdown.show ~ *,
  .td-actions:has(.dropdown.show) {
    z-index: 100;
    position: relative;
  }

  .td-actions ::v-deep .dropdown-item {
    padding: 8px 16px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #212529;

    i {
      width: 16px;
      text-align: center;
    }

    &:hover {
      background-color: #f8f9fa;
      color: #212529;
    }

    &.text-danger {
      color: #dc3545 !important;

      &:hover {
        background-color: #fff5f5;
        color: #dc3545 !important;
      }
    }
  }

  .csv-preview {
    margin-top: 20px;
    max-height: 300px;
    overflow-y: auto;
  }

  .badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .badge-success {
    background-color: #20b000;
    color: white;
  }

  .badge-warning {
    background-color: #ffc107;
    color: #000;
  }

  .badge-secondary {
    background-color: #6c757d;
    color: white;
  }

  .badge-info {
    background-color: #17a2b8;
    color: white;
  }

  .badge-danger {
    background-color: #dc3545;
    color: white;
  }

  .status-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }

  .status-container .badge {
    white-space: nowrap;
  }
}
</style>

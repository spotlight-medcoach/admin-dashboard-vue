<template>
  <div id="students">
    <!-- Email Queue Status Widget (admin only) -->
    <email-queue-status
      v-if="showEmailQueueStatus && !isSupervisor"
      :status="emailQueueStatus"
      @close="showEmailQueueStatus = false"
    />

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
            search-placeholder="Buscar por nombre, email, ID o teléfono"
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
              <nuxt-link
                :to="`/students/${row._id}`"
                class="student-name-link"
              >
                {{ row.name }} {{ row.last_name }}
              </nuxt-link>
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
                  v-if="row.last_welcome_email_status"
                  :class="getEmailStatusClass(row.last_welcome_email_status)"
                  class="ml-2"
                >
                  {{ getEmailStatusText(row.last_welcome_email_status) }}
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
                  <b-dropdown-item :to="`/students/${row._id}`">
                    <i class="fas fa-eye"></i> Ver detalle
                  </b-dropdown-item>
                  <template v-if="!isSupervisor">
                    <b-dropdown-item @click="resendWelcomeEmail(row._id)">
                      <i class="fas fa-envelope"></i> Reenviar correo
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
                  </template>
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

        <b-form-group
          label="ID Estudiante (Universidad)"
          label-for="university_student_id"
        >
          <b-form-input
            id="university_student_id"
            v-model="manualForm.university_student_id"
            placeholder="ID del estudiante en la universidad (opcional)"
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
        description="El archivo debe tener las columnas: nombre(s), apellidos, universidad, fecha de examen. Columna opcional: id estudiante"
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
              <th>ID Estudiante</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in csvPreview.slice(0, 5)" :key="index">
              <td>{{ row.name }}</td>
              <td>{{ row.last_name }}</td>
              <td>{{ row.university }}</td>
              <td>{{ row.exam_year }}</td>
              <td>{{ row.university_student_id || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <b-form-group>
        <b-form-checkbox v-model="sendEmails">
          Enviar correo de bienvenida a todos los estudiantes creados
        </b-form-checkbox>
      </b-form-group>

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

    <!-- Bulk Email Modal -->
    <bulk-email-modal
      :show="showBulkEmailModal"
      :universities="universities"
      @close="showBulkEmailModal = false"
      @send="handleBulkEmailSent"
    />

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

    <!-- Resend Email Confirmation Modal -->
    <b-modal
      id="resend-email-modal"
      v-model="showResendEmailModal"
      title="Reenviar correo de bienvenida"
      @ok="confirmResendWelcomeEmail"
    >
      <p>
        Ya se ha enviado un correo de bienvenida a
        <strong
          >{{ studentToResendEmail && studentToResendEmail.name }}
          {{ studentToResendEmail && studentToResendEmail.last_name }}</strong
        >
        el día
        <strong>{{
          formatDate(
            studentToResendEmail &&
              studentToResendEmail.last_welcome_email_sent_at
          )
        }}</strong
        >.
      </p>
      <p>¿Deseas enviar otro correo de bienvenida?</p>
    </b-modal>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import DataTableContainer from '@/components/tables/data-table-container.vue';
import EmailQueueStatus from '@/components/email-queue-status.vue';
import BulkEmailModal from '@/components/students/bulk-email-modal.vue';

export default {
  components: {
    DataTableContainer,
    EmailQueueStatus,
    BulkEmailModal,
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
      showResendEmailModal: false,
      studentToResendEmail: null,
      saving: false,
      universities: [],
      sortBy: 'name',
      sortOrder: 'asc',
      userRole: null,
      manualForm: {
        name: '',
        last_name: '',
        email: '',
        phone: '',
        university: '',
        exam_year: new Date().getFullYear(),
        university_student_id: '',
      },
      csvFile: null,
      csvContent: '',
      csvPreview: [],
      sendEmails: false,
      emailQueueStatusPolling: null,
      showEmailQueueStatus: false,
      selectedExamYear: '',
      selectedProfileStatus: '',
      showBulkEmailModal: false,
    };
  },
  computed: {
    ...mapGetters('students', [
      'getStudents',
      'getTotalStudents',
      'isLoading',
      'isSaving',
      'getEmailQueueStatus',
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
    emailQueueStatus() {
      return this.getEmailQueueStatus;
    },
    isSupervisor() {
      return this.userRole === 'Supervisor';
    },
    filterValues() {
      return {
        university: this.selectedUniversity,
        exam_year: this.selectedExamYear,
        profile_completed: this.selectedProfileStatus,
      };
    },
    tableFilters() {
      const filters = [];

      // Hide university filter for supervisors (backend filters by their university)
      if (!this.isSupervisor) {
        filters.push({
          key: 'university',
          label: 'Universidad',
          placeholder: 'Todas las universidades',
          defaultValue: '',
          options: this.universityFilterOptions,
        });
      }

      filters.push(
        {
          key: 'exam_year',
          label: 'Año de examen',
          placeholder: 'Todos los años',
          defaultValue: '',
          options: this.examYearOptions,
        },
        {
          key: 'profile_completed',
          label: 'Estado de registro',
          placeholder: 'Todos',
          defaultValue: '',
          options: [
            { id: 'true', name: 'Registro completo' },
            { id: 'false', name: 'Pendiente' },
          ],
        }
      );

      return filters;
    },
    examYearOptions() {
      const currentYear = new Date().getFullYear();
      const years = [];
      // Generar años desde 2020 hasta 5 años en el futuro
      for (let year = 2020; year <= currentYear + 5; year++) {
        years.push({ id: year.toString(), name: year.toString() });
      }
      return years.reverse(); // Más recientes primero
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
          key: 'university_student_id',
          label: 'ID Estudiante',
          scope: 'col',
          width: 120,
          value: (row) => row.university_student_id || '-',
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

        if (this.selectedExamYear && this.selectedExamYear.trim() !== '') {
          params.exam_year = parseInt(this.selectedExamYear);
        }

        if (
          this.selectedProfileStatus &&
          this.selectedProfileStatus.trim() !== ''
        ) {
          params.profile_completed = this.selectedProfileStatus === 'true';
        }

        await this.$store.dispatch('students/fetchStudents', params);
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
      } else if (key === 'exam_year') {
        this.selectedExamYear = value;
      } else if (key === 'profile_completed') {
        this.selectedProfileStatus = value;
      }
      this.page = 1;
      this.loadStudents();
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
      } else if (action === 'sendBulkEmails') {
        this.showBulkEmailModal = true;
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
        university_student_id: '',
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
      const studentIdIndex = header.indexOf('id estudiante');

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
          university_student_id:
            studentIdIndex !== -1 ? values[studentIdIndex] || '' : '',
        });
      }
    },
    async uploadCSV() {
      if (!this.csvContent) return;

      this.saving = true;
      try {
        const result = await this.$store.dispatch(
          'students/createStudentsBulk',
          { csvContent: this.csvContent, sendEmails: this.sendEmails }
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
      this.sendEmails = false;
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
    resendWelcomeEmail(studentId) {
      // Find the student to check if email was already sent
      const student = this.students.find((s) => s._id === studentId);
      if (!student) return;

      // If the student already has a welcome email sent, show confirmation modal
      if (student.last_welcome_email_sent_at) {
        this.studentToResendEmail = student;
        this.showResendEmailModal = true;
      } else {
        // No previous email sent, send directly
        this.sendWelcomeEmailToStudent(studentId);
      }
    },
    async sendWelcomeEmailToStudent(studentId) {
      try {
        await this.$store.dispatch('students/resendWelcomeEmail', studentId);
        this.$bvToast.toast('Correo de bienvenida reenviado exitosamente', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
        // Reload students to update the email status
        await this.loadStudents();
      } catch (error) {
        console.error('Error resending welcome email:', error);
        this.$bvToast.toast('Error al reenviar correo de bienvenida', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    async confirmResendWelcomeEmail() {
      if (!this.studentToResendEmail) return;

      await this.sendWelcomeEmailToStudent(this.studentToResendEmail._id);
      this.studentToResendEmail = null;
      this.showResendEmailModal = false;
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    getEmailStatusText(status) {
      const statusMap = {
        pending: 'Correo pendiente',
        sent: 'Correo enviado',
        failed: 'Correo fallido',
      };
      return statusMap[status] || '';
    },
    getEmailStatusClass(status) {
      const classMap = {
        pending: 'badge badge-info',
        sent: 'badge badge-success',
        failed: 'badge badge-danger',
      };
      return classMap[status] || 'badge badge-secondary';
    },
    async handleBulkEmailSent() {
      // Show the component and start polling for email queue status
      this.showEmailQueueStatus = true;
      this.startEmailQueueStatusPolling();
      // Reload students
      await this.loadStudents();
    },
    async startEmailQueueStatusPolling() {
      // Clear existing polling
      if (this.emailQueueStatusPolling) {
        clearInterval(this.emailQueueStatusPolling);
      }

      // Poll every 3 seconds
      this.emailQueueStatusPolling = setInterval(async () => {
        try {
          const status = await this.$store.dispatch(
            'students/getEmailQueueStatus'
          );

          // Stop polling if all emails are processed (no pending)
          if (status.pending === 0) {
            clearInterval(this.emailQueueStatusPolling);
            this.emailQueueStatusPolling = null;
            this.$bvToast.toast('Todos los correos han sido procesados', {
              title: 'Completado',
              variant: 'success',
              solid: true,
            });
          }
        } catch (error) {
          console.error('Error polling email queue status:', error);
          // Stop polling on error
          clearInterval(this.emailQueueStatusPolling);
          this.emailQueueStatusPolling = null;
        }
      }, 3000);
    },
  },
  async created() {
    if (process.browser) {
      // Load user role
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          this.userRole = user.role;
        }
      } catch (e) {
        console.error('Error loading user role:', e);
      }

      // Only load universities for non-supervisor users
      if (this.userRole !== 'Supervisor') {
        await this.fetchUniversities();
      }
    }
  },
  async mounted() {
    // Set page header - hide action buttons for supervisors
    if (this.isSupervisor) {
      this.$store.dispatch('pageHeader/setHeader', {
        title: 'Estudiantes',
      });
    } else {
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
            {
              text: 'Enviar correos masivos',
              action: 'sendBulkEmails',
              icon: 'fas fa-paper-plane',
            },
          ],
        },
      });

      this.$nuxt.$on('page-header-button-click', this.handleHeaderButtonClick);
    }

    await this.loadStudents();
    this.isInitialLoad = false;

    // Load initial email queue status (admin only)
    if (!this.isSupervisor) {
      await this.$store.dispatch('students/getEmailQueueStatus');
      // Only show component and start polling if there are pending emails
      if (this.emailQueueStatus.pending > 0) {
        this.showEmailQueueStatus = true;
        this.startEmailQueueStatusPolling();
      }
    }
  },
  beforeDestroy() {
    // Clear email queue status polling
    if (this.emailQueueStatusPolling) {
      clearInterval(this.emailQueueStatusPolling);
      this.emailQueueStatusPolling = null;
    }

    this.$store.dispatch('pageHeader/clearHeader');
    if (!this.isSupervisor) {
      this.$nuxt.$off('page-header-button-click', this.handleHeaderButtonClick);
    }
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

  .student-name-link {
    color: #ff9300;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;

    &:hover {
      color: #db7500;
      text-decoration: underline;
    }
  }
}
</style>

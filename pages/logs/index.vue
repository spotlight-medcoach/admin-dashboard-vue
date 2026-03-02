<template>
  <div class="logs-page">
    <div class="head-container">
      <p class="title">Logs del sistema</p>
    </div>

    <div class="filters-container">
      <select v-model="selectedUserId" class="filter-control">
        <option value="">Todos los usuarios</option>
        <option v-for="user in users" :key="user.id" :value="user.id">
          {{ user.name }}
        </option>
      </select>

      <select v-model="selectedUserType" class="filter-control">
        <option value="">Todos los tipos de usuario</option>
        <option value="student">Estudiante</option>
        <option value="admin">Administrador</option>
        <option value="professor">Profesor</option>
      </select>

      <select v-model="selectedLogType" class="filter-control">
        <option value="">Todos los tipos</option>
        <option v-for="option in logTypeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <input
        v-model="fromDate"
        class="filter-control"
        type="datetime-local"
        placeholder="Desde"
      />

      <input
        v-model="toDate"
        class="filter-control"
        type="datetime-local"
        placeholder="Hasta"
      />

      <button class="filter-button" type="button" @click="applyFilters">
        Filtrar
      </button>
    </div>

    <div class="table-container">
      <table class="table table-bordered">
        <thead class="thead-logs">
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Tipo de usuario</th>
            <th>Tipo de log</th>
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody class="tbody-logs">
          <tr v-if="loading">
            <td colspan="5" class="text-center">Cargando logs...</td>
          </tr>
          <tr v-else-if="logs.length === 0">
            <td colspan="5" class="text-center">No hay logs para los filtros aplicados</td>
          </tr>
          <tr v-for="log in logs" :key="log._id">
            <td>{{ formatDate(log.created_at) }}</td>
            <td>{{ getUserName(log) }}</td>
            <td>
              <span class="user-type-badge" :class="getUserTypeBadgeClass(log.user_type)">
                {{ getUserTypeLabel(log.user_type) }}
              </span>
            </td>
            <td>
              <span class="log-badge" :class="getLogTypeBadgeClass(log.log_type)">
                {{ getLogTypeLabel(log.log_type) }}
              </span>
            </td>
            <td>
              <button class="details-button" type="button" @click="openDetail(log)">
                Ver detalle
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-container">
      <div class="select-container">
        <span>Resultados por página:</span>
        <select v-model.number="pageResults" class="pagination-select" @change="onPageResultsChange">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>

      <div class="arrows-container">
        <span>
          {{ startRange }} - {{ endRange }} de {{ totalLogs }} logs
        </span>
        <button
          class="btn fas fa-chevron-left"
          :disabled="currentPage <= 1"
          @click="prevPage"
        ></button>
        <button
          class="btn fas fa-chevron-right"
          :disabled="currentPage * pageResults >= totalLogs"
          @click="nextPage"
        ></button>
      </div>
    </div>

    <LogDetailModal
      v-if="selectedLog"
      :log="selectedLog"
      @close="selectedLog = null"
    />
  </div>
</template>

<script>
import LogDetailModal from '@/components/logs/log-detail-modal.vue';

export default {
  components: {
    LogDetailModal,
  },
  data() {
    return {
      selectedUserId: '',
      selectedUserType: '',
      selectedLogType: '',
      fromDate: '',
      toDate: '',
      users: [],
      selectedLog: null,
      currentPage: 1,
      pageResults: 20,
      logTypeLabelMap: {
        login: 'Inicio de sesión',
        get_manual_content: 'Ver contenido de manual',
        save_note: 'Guardar nota',
        create_flashcard: 'Crear flashcard',
        delete_flashcard: 'Eliminar flashcard',
        complete_manual: 'Completar manual',
        create_custom_test: 'Crear examen personalizado',
        finish_custom_test: 'Finalizar examen personalizado',
        complete_infographic: 'Completar infográfico',
        logout: 'Cerrar sesión',
      },
    };
  },
  computed: {
    logs() {
      return this.$store.getters['logs/getLogs'] || [];
    },
    totalLogs() {
      return this.$store.getters['logs/getTotalLogs'] || 0;
    },
    loading() {
      return this.$store.getters['logs/isLoading'];
    },
    logTypeOptions() {
      return Object.keys(this.logTypeLabelMap).map((value) => ({
        value,
        label: this.logTypeLabelMap[value],
      }));
    },
    startRange() {
      if (this.totalLogs === 0) return 0;
      return (this.currentPage - 1) * this.pageResults + 1;
    },
    endRange() {
      if (this.totalLogs === 0) return 0;
      const currentEnd = this.currentPage * this.pageResults;
      return currentEnd > this.totalLogs ? this.totalLogs : currentEnd;
    },
  },
  async created() {
    if (process.browser) {
      const role = this.getUserRole();
      if (role !== 'Administrador') {
        this.$router.push({ path: '/students' });
        return;
      }
    }

    await this.loadUsers();
    await this.fetchLogs();
  },
  methods: {
    getUserRole() {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const user = JSON.parse(raw);
        return user.role || null;
      } catch (error) {
        return null;
      }
    },
    async loadUsers() {
      try {
        const response = await this.$axios.get('/students', {
          params: {
            page: 1,
            limit: 200,
          },
        });
        const students = response.data.data || response.data.payload || [];
        this.users = students.map((student) => ({
          id: student._id,
          name:
            `${student.name || ''} ${student.last_name || ''}`.trim() ||
            `${student.first_name || ''} ${student.last_name || ''}`.trim() ||
            student.name ||
            student.email ||
            student._id,
        }));
      } catch (error) {
        console.error('Error loading users for logs filter:', error);
        this.users = [];
      }
    },
    toIsoOrUndefined(value) {
      if (!value) return undefined;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return undefined;
      return date.toISOString();
    },
    async fetchLogs() {
      await this.$store.dispatch('logs/fetchLogs', {
        page: this.currentPage,
        pageResults: this.pageResults,
        user_id: this.selectedUserId || undefined,
        user_type: this.selectedUserType || undefined,
        log_type: this.selectedLogType || undefined,
        from: this.toIsoOrUndefined(this.fromDate),
        to: this.toIsoOrUndefined(this.toDate),
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
    },
    async applyFilters() {
      this.currentPage = 1;
      await this.fetchLogs();
    },
    async onPageResultsChange() {
      this.currentPage = 1;
      await this.fetchLogs();
    },
    async prevPage() {
      if (this.currentPage <= 1) return;
      this.currentPage -= 1;
      await this.fetchLogs();
    },
    async nextPage() {
      if (this.currentPage * this.pageResults >= this.totalLogs) return;
      this.currentPage += 1;
      await this.fetchLogs();
    },
    openDetail(log) {
      this.selectedLog = log;
    },
    getUserName(log) {
      if (!log) return '-';
      if (log.user && log.user.name) return log.user.name;
      return log.user_id || '-';
    },
    getLogTypeLabel(logType) {
      if (!logType) return '-';
      return this.logTypeLabelMap[logType] || logType;
    },
    getLogTypeBadgeClass(logType) {
      const map = {
        login: 'badge-login',
        logout: 'badge-logout',
        get_manual_content: 'badge-read',
        save_note: 'badge-note',
        create_flashcard: 'badge-create',
        delete_flashcard: 'badge-delete',
        complete_manual: 'badge-complete',
        create_custom_test: 'badge-create',
        finish_custom_test: 'badge-complete',
        complete_infographic: 'badge-complete',
      };
      return map[logType] || 'badge-default';
    },
    getUserTypeLabel(userType) {
      const map = {
        student: 'Estudiante',
        admin: 'Administrador',
        professor: 'Profesor',
      };
      return map[userType] || '-';
    },
    getUserTypeBadgeClass(userType) {
      const map = {
        student: 'user-badge-student',
        admin: 'user-badge-admin',
        professor: 'user-badge-professor',
      };
      return map[userType] || 'user-badge-default';
    },
    formatDate(value) {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return date.toLocaleString();
    },
  },
};
</script>

<style scoped>
.logs-page {
  width: 100%;
  font-family: Montserrat, sans-serif;
}

.head-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 500;
  font-size: 32px;
  margin-bottom: 0;
}

.filters-container {
  margin: 24px 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(170px, 1fr));
  gap: 12px;
}

.filter-control {
  height: 44px;
  border: 1px solid #d4d5d7;
  border-radius: 8px;
  padding: 0 10px;
  outline: none;
}

.filter-button {
  border: none;
  border-radius: 8px;
  background: #1ca4fc;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
}

.table-container {
  overflow-x: auto;
}

.thead-logs {
  background: #212529;
  color: #fff;
  text-transform: uppercase;
  font-size: 12px;
}

.thead-logs th:first-child {
  border-radius: 15px 0 0 0;
  border: 1px solid #fff;
}

.thead-logs th:last-child {
  border-radius: 0 15px 0 0;
  border: 1px solid #fff;
}

.tbody-logs {
  font-size: 12px;
}

.actions-col {
  width: 120px;
}

.details-button {
  border: none;
  background: #fe9400;
  color: white;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
}

.log-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.badge-login {
  background: #e0f7ec;
  color: #0f7a47;
}

.badge-logout {
  background: #ffe9e9;
  color: #b42318;
}

.badge-read {
  background: #e7f0ff;
  color: #1f4fa0;
}

.badge-note {
  background: #f4ebff;
  color: #6941c6;
}

.badge-create {
  background: #e6fbff;
  color: #0e7490;
}

.badge-delete {
  background: #fff0f0;
  color: #c81e1e;
}

.badge-complete {
  background: #ecfdf3;
  color: #027a48;
}

.badge-default {
  background: #f2f4f7;
  color: #344054;
}

.user-type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
}

.user-badge-student {
  background: #e7f0ff;
  color: #1f4fa0;
}

.user-badge-admin {
  background: #ecfdf3;
  color: #027a48;
}

.user-badge-professor {
  background: #f4ebff;
  color: #6941c6;
}

.user-badge-default {
  background: #f2f4f7;
  color: #344054;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  height: 56px;
  margin-top: 16px;
}

.select-container {
  display: flex;
  align-items: center;
  margin: 0 40px;
}

.select-container span {
  font-size: 12px;
  margin-right: 8px;
}

.pagination-select {
  border: none;
  border-bottom: 1px solid #000;
  background-color: transparent;
  outline: none;
}

.arrows-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.arrows-container span {
  font-size: 12px;
}

.arrows-container button {
  color: #fe9400;
}

.text-center {
  text-align: center;
}

@media (max-width: 1200px) {
  .filters-container {
    grid-template-columns: repeat(2, minmax(170px, 1fr));
  }
}

@media (max-width: 768px) {
  .filters-container {
    grid-template-columns: 1fr;
  }
}
</style>

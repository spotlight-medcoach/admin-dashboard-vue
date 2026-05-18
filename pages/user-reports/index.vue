<template>
  <div>
    <Navigation />

    <!-- Modal de resolución -->
    <transition name="ur-modal-fade">
      <div v-if="resolutionModal.show" class="ur-modal-overlay" @click.self="cancelResolution">
        <div class="ur-modal">
          <div class="ur-modal__header">
            <span class="ur-modal__title">Finalizar reporte</span>
            <button class="ur-modal__close" @click="cancelResolution"><i class="fas fa-times"></i></button>
          </div>
          <div class="ur-modal__body">
            <p class="ur-modal__desc">
              Se marcará el reporte como
              <strong>{{ resolutionModal.targetStatus | statusLabel }}</strong>
              y se enviará un correo al estudiante.
            </p>
            <label class="ur-modal__label">
              Nota para el estudiante <span class="ur-modal__optional">(opcional)</span>
            </label>
            <textarea
              v-model="resolutionModal.note"
              class="ur-modal__textarea"
              placeholder="Escribe aquí algún comentario o explicación para el estudiante..."
              rows="4"
              autofocus
            ></textarea>
          </div>
          <div class="ur-modal__footer">
            <button class="ur-modal__btn-cancel" @click="cancelResolution">Cancelar</button>
            <button class="ur-modal__btn-confirm" :disabled="resolutionModal.saving" @click="confirmResolution">
              <i v-if="resolutionModal.saving" class="fas fa-spinner fa-spin"></i>
              {{ resolutionModal.saving ? 'Guardando…' : 'Finalizar y notificar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <div class="ur-container">
      <!-- Header -->
      <div class="ur-header">
        <div class="ur-header__left">
          <h1>Reportes de usuarios</h1>
          <span class="ur-header__total">{{ total }}</span>
        </div>
        <div class="ur-header__actions">
          <button
            :class="['ur-view-btn', { 'ur-view-btn--active': viewMode === 'table' }]"
            @click="setView('table')"
          >
            <i class="fas fa-table"></i> Tabla
          </button>
          <button
            :class="['ur-view-btn', { 'ur-view-btn--active': viewMode === 'kanban' }]"
            @click="setView('kanban')"
          >
            <i class="fas fa-columns"></i> Kanban
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="ur-filters">
        <select v-model="filters.report_type" class="ur-filters__select" @change="onTypeChange">
          <option value="">Todos los tipos</option>
          <option value="bug">🐛 Bugs</option>
          <option value="suggestion">💡 Sugerencias</option>
          <option value="feedback">⭐ Retroalimentación</option>
        </select>

        <select v-model="filters.status" class="ur-filters__select" @change="fetchReports">
          <option value="">Todos los status</option>
          <!-- Sin tipo seleccionado: muestra todos agrupados -->
          <template v-if="!filters.report_type">
            <optgroup v-for="group in allStatusGroups" :key="group.label" :label="group.label">
              <option v-for="s in group.statuses" :key="group.key + s.value" :value="s.value">{{ s.label }}</option>
            </optgroup>
          </template>
          <!-- Con tipo seleccionado: muestra solo los de ese tipo -->
          <template v-else>
            <option v-for="s in availableStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
          </template>
        </select>

        <input v-model="filters.from" type="date" class="ur-filters__date" @change="fetchReports" />
        <input v-model="filters.to" type="date" class="ur-filters__date" @change="fetchReports" />
      </div>

      <Loading v-if="loading" />

      <!-- Vista Tabla -->
      <div v-if="!loading && viewMode === 'table'" class="ur-table-wrapper">
        <table class="table table-bordered ur-table">
          <thead class="ur-thead">
            <tr>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Status</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in reports" :key="r._id">
              <td><span :class="['ur-badge', `ur-badge--${r.report_type}`]">{{ typeLabel(r.report_type) }}</span></td>
              <td class="ur-truncate" :title="r.description">{{ r.description | truncate(45) }}</td>
              <td>
                <span v-if="r.student_id">{{ r.student_id.name }} {{ r.student_id.last_name }}</span>
              </td>
              <td>{{ r.created_at | formatDate }}</td>
              <td><span :class="['ur-pill', `ur-pill--${r.report_type}`]">{{ r.status | statusLabel }}</span></td>
              <td>
                <button class="btn ur-btn-detail" @click="goToDetail(r._id)"><i class="fas fa-eye"></i> Ver</button>
                <button
                  v-if="!isResolved(r)"
                  class="btn ur-btn-resolve"
                  title="Finalizar reporte"
                  @click="openResolutionModal(r)"
                ><i class="fas fa-check-circle"></i></button>
                <button class="btn ur-btn-delete" @click="confirmDelete(r)"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr v-if="reports.length === 0"><td colspan="6" class="text-center py-4">No hay reportes</td></tr>
          </tbody>
        </table>

        <!-- Paginación -->
        <div class="ur-pagination">
          <span>{{ paginationLabel }}</span>
          <button class="btn" :disabled="page <= 1" @click="changePage(-1)"><i class="fas fa-chevron-left"></i></button>
          <button class="btn" :disabled="page >= totalPages" @click="changePage(1)"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>

      <!-- Vista Kanban -->
      <div v-if="!loading && viewMode === 'kanban'" class="ur-kanban">
        <div
          v-for="col in kanbanColumns"
          :key="col.value"
          class="ur-kanban__col"
        >
          <div class="ur-kanban__col-header">
            <span class="ur-kanban__col-title">{{ col.label }}</span>
            <span class="ur-kanban__col-count">{{ kanbanCards(col.value).length }}</span>
          </div>
          <div
            class="ur-kanban__cards"
            :class="{ 'ur-kanban__cards--over': dragOverColumn === col.value }"
            @dragover.prevent="dragOverColumn = col.value"
            @dragleave.self="dragOverColumn = null"
            @drop.prevent="onDrop(col.value)"
          >
            <div
              v-for="r in kanbanCards(col.value)"
              :key="r._id"
              class="ur-kanban__card"
              draggable="true"
              :class="{ 'ur-kanban__card--dragging': draggedReport && draggedReport._id === r._id }"
              @dragstart="onDragStart(r)"
              @dragend="draggedReport = null"
              @click="goToDetail(r._id)"
            >
              <span :class="['ur-badge', `ur-badge--${r.report_type}`]">{{ typeLabel(r.report_type) }}</span>
              <p class="ur-kanban__card-desc">{{ r.description | truncate(70) }}</p>
              <p class="ur-kanban__card-meta">
                <span v-if="r.student_id">{{ r.student_id.name }} {{ r.student_id.last_name }}</span>
                · {{ r.created_at | formatDate }}
              </p>
            </div>
            <p v-if="kanbanCards(col.value).length === 0" class="ur-kanban__empty">
              <i class="fas fa-inbox"></i><br>Sin reportes
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navigation from '@/components/navs/navigation.vue';
import Loading from '@/components/modals/loading.modal.vue';

const RESOLUTION_STATUSES = { bug: 'resuelto', suggestion: 'desplegado', feedback: 'leido' };

const STATUS_MAP = {
  bug: [
    { value: 'reportado', label: 'Reportado' },
    { value: 'atendiendo', label: 'Atendiendo' },
    { value: 'irreproducible', label: 'Irreproducible' },
    { value: 'resuelto', label: 'Resuelto' },
    { value: 'archivado', label: 'Archivado' },
  ],
  suggestion: [
    { value: 'reportado', label: 'Reportado' },
    { value: 'evaluando', label: 'Evaluando' },
    { value: 'descartado', label: 'Descartado' },
    { value: 'por_implementar', label: 'Por implementar' },
    { value: 'desarrollando', label: 'Desarrollando' },
    { value: 'terminado_por_validar', label: 'Terminado / por validar' },
    { value: 'validado', label: 'Validado' },
    { value: 'desplegado', label: 'Desplegado' },
  ],
  feedback: [
    { value: 'sin_leer', label: 'Sin leer' },
    { value: 'leido', label: 'Leído' },
  ],
};

export default {
  components: { Navigation, Loading },
  filters: {
    truncate (val, len) {
      if (!val) { return ''; }
      return val.length > len ? val.slice(0, len) + '…' : val;
    },
    formatDate (val) {
      if (!val) { return ''; }
      return new Date(val).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    statusLabel (val) {
      if (!val) { return ''; }
      return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    },
  },
  data () {
    return {
      loading: false,
      reports: [],
      total: 0,
      page: 1,
      limit: 50,
      viewMode: localStorage.getItem('ur_view') || 'table',
      filters: { report_type: '', status: '', from: '', to: '' },
      draggedReport: null,
      dragOverColumn: null,
      resolutionModal: {
        show: false,
        report: null,
        targetStatus: null,
        note: '',
        saving: false,
      },
    };
  },
  computed: {
    totalPages () { return Math.ceil(this.total / this.limit); },
    paginationLabel () {
      const from = (this.page - 1) * this.limit + 1;
      const to = Math.min(this.page * this.limit, this.total);
      return `${from}–${to} de ${this.total}`;
    },
    availableStatuses () {
      if (!this.filters.report_type) { return []; }
      return STATUS_MAP[this.filters.report_type] || [];
    },
    allStatusGroups () {
      return [
        { key: 'bug', label: '🐛 Bugs', statuses: STATUS_MAP.bug },
        { key: 'suggestion', label: '💡 Sugerencias', statuses: STATUS_MAP.suggestion },
        { key: 'feedback', label: '⭐ Retroalimentación', statuses: STATUS_MAP.feedback },
      ];
    },
    kanbanColumns () {
      const type = this.filters.report_type || 'bug';
      return STATUS_MAP[type] || STATUS_MAP.bug;
    },
  },
  async created () {
    await this.fetchReports();
  },
  methods: {
    async fetchReports () {
      this.loading = true;
      try {
        const params = { page: this.page, limit: this.limit };
        if (this.filters.report_type) { params.report_type = this.filters.report_type; }
        if (this.filters.status) { params.status = this.filters.status; }
        if (this.filters.from) { params.from = this.filters.from; }
        if (this.filters.to) { params.to = this.filters.to; }

        const res = await this.$axios.get('/user-reports', { params });
        this.reports = res.data.data;
        this.total = res.data.pagination.total;
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    onTypeChange () {
      this.filters.status = '';
      this.fetchReports();
    },
    setView (mode) {
      this.viewMode = mode;
      localStorage.setItem('ur_view', mode);
    },
    kanbanCards (status) {
      return this.reports.filter((r) => r.status === status);
    },
    typeLabel (type) {
      return { bug: '🐛 Bug', suggestion: '💡 Sugerencia', feedback: '⭐ Feedback' }[type] || type;
    },
    onDragStart (report) {
      this.draggedReport = report;
    },
    onDrop (targetStatus) {
      this.dragOverColumn = null;
      const report = this.draggedReport;
      this.draggedReport = null;
      if (!report || report.status === targetStatus) { return; }
      // Si el destino es el status de resolución, abrir modal en lugar de mover directo
      if (targetStatus === RESOLUTION_STATUSES[report.report_type]) {
        this.openResolutionModal(report, targetStatus);
      } else {
        this.moveCard(report, targetStatus);
      }
    },
    async moveCard (report, newStatus, resolutionNote) {
      const prevStatus = report.status;
      report.status = newStatus; // optimistic
      try {
        await this.$axios.patch(`/user-reports/${report._id}/status`, {
          status: newStatus,
          resolution_note: resolutionNote || undefined,
        });
      } catch (err) {
        report.status = prevStatus; // revert
        console.error(err);
      }
    },
    isResolved (report) {
      return report.status === RESOLUTION_STATUSES[report.report_type];
    },
    openResolutionModal (report, targetStatus) {
      const resolveStatus = targetStatus || RESOLUTION_STATUSES[report.report_type];
      this.resolutionModal = { show: true, report, targetStatus: resolveStatus, note: '', saving: false };
    },
    cancelResolution () {
      this.resolutionModal.show = false;
    },
    async confirmResolution () {
      const { report, targetStatus, note } = this.resolutionModal;
      this.resolutionModal.saving = true;
      try {
        await this.moveCard(report, targetStatus, note);
        this.resolutionModal.show = false;
      } catch (err) {
        console.error(err);
        this.resolutionModal.saving = false;
      }
    },
    goToDetail (id) { this.$router.push(`/user-reports/${id}`); },
    async confirmDelete (report) {
      if (!confirm('¿Eliminar este reporte? Esta acción no se puede deshacer.')) { return; }
      try {
        await this.$axios.delete(`/user-reports/${report._id}`);
        this.reports = this.reports.filter((r) => r._id !== report._id);
        this.total -= 1;
      } catch (err) { console.error(err); }
    },
    changePage (delta) {
      this.page = Math.max(1, Math.min(this.totalPages, this.page + delta));
      this.fetchReports();
    },
  },
};
</script>

<style scoped>
.ur-container {
  padding: 28px 32px 0;
  font-family: Montserrat, sans-serif;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px); /* 64px = content-container padding top + bottom (16+16) + page-content-wrapper has flex:1 */
}

.ur-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.ur-header__left { display: flex; align-items: center; gap: 12px; }
.ur-header__left h1 { font-size: 26px; font-weight: 700; margin: 0; }
.ur-header__total { background: #f0f0f0; border-radius: 20px; padding: 2px 12px; font-size: 13px; }
.ur-header__actions { display: flex; gap: 8px; }

.ur-view-btn {
  padding: 7px 14px; border: 1px solid #dee2e6; border-radius: 8px;
  background: #fff; font-size: 13px; cursor: pointer; color: #6c757d;
  transition: all .15s;
}
.ur-view-btn--active { background: #212529; color: #fff; border-color: #212529; }

.ur-filters { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
.ur-filters__select,
.ur-filters__date {
  height: 36px; border: 1px solid #dee2e6; border-radius: 8px;
  padding: 0 10px; font-size: 13px; background: #fff;
}

/* Table */
.ur-table-wrapper { overflow-x: auto; }
.ur-table { font-size: 13px; }
.ur-thead { background: #212529; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
.ur-truncate { max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.ur-badge {
  display: inline-flex; align-items: center; padding: 3px 8px;
  border-radius: 20px; font-size: 12px; font-weight: 600;
}
.ur-badge--bug       { background: #ffebee; color: #c62828; }
.ur-badge--suggestion{ background: #fffde7; color: #f57f17; }
.ur-badge--feedback  { background: #fff8e1; color: #f9a825; }

.ur-pill {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.ur-pill--bug        { background: #ffebee; color: #c62828; }
.ur-pill--suggestion { background: #e3f2fd; color: #1565c0; }
.ur-pill--feedback   { background: #e8f5e9; color: #2e7d32; }

.ur-btn-detail  { color: #1ca4fc; font-size: 12px; }
.ur-btn-resolve { color: #28a745; font-size: 14px; margin-left: 4px; }
.ur-btn-delete  { color: #dc3545; font-size: 12px; margin-left: 4px; }

/* Modal de resolución */
.ur-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.ur-modal {
  background: #fff;
  border-radius: 14px;
  width: 480px;
  max-width: calc(100vw - 32px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, .2);
  overflow: hidden;
}
.ur-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
}
.ur-modal__title { font-size: 16px; font-weight: 700; color: #212529; }
.ur-modal__close {
  background: none; border: none; font-size: 16px;
  color: #adb5bd; cursor: pointer; padding: 4px 6px; border-radius: 4px;
}
.ur-modal__close:hover { background: #f0f0f0; color: #495057; }
.ur-modal__body { padding: 24px; }
.ur-modal__desc { font-size: 14px; color: #495057; margin: 0 0 16px; }
.ur-modal__label {
  display: block; font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .6px; color: #6c757d; margin-bottom: 8px;
}
.ur-modal__optional { font-weight: 400; text-transform: none; letter-spacing: 0; }
.ur-modal__textarea {
  width: 100%; border: 1px solid #dee2e6; border-radius: 8px;
  padding: 10px 14px; font-size: 14px; font-family: inherit;
  resize: vertical; box-sizing: border-box; line-height: 1.5;
}
.ur-modal__textarea:focus { outline: none; border-color: #fe9400; }
.ur-modal__footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px; border-top: 1px solid #f0f0f0;
}
.ur-modal__btn-cancel {
  padding: 9px 20px; border: 1px solid #dee2e6; border-radius: 8px;
  background: #fff; font-size: 14px; cursor: pointer; color: #495057;
}
.ur-modal__btn-confirm {
  padding: 9px 20px; border: none; border-radius: 8px;
  background: #28a745; color: #fff; font-weight: 700;
  font-size: 14px; cursor: pointer; transition: background .15s;
  display: flex; align-items: center; gap: 8px;
}
.ur-modal__btn-confirm:hover:not(:disabled) { background: #218838; }
.ur-modal__btn-confirm:disabled { opacity: .6; cursor: not-allowed; }

.ur-modal-fade-enter-active { transition: opacity .2s ease; }
.ur-modal-fade-leave-active { transition: opacity .15s ease; }
.ur-modal-fade-enter, .ur-modal-fade-leave-to { opacity: 0; }

.ur-pagination { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 14px; font-size: 13px; }

/* Kanban */
.ur-kanban {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  min-height: 0;       /* necesario para que flex hijo pueda hacer overflow-y */
  padding-bottom: 20px;
}

.ur-kanban__col {
  min-width: 280px;
  max-width: 280px;
  background: #f4f5f7;
  border-radius: 14px;
  border: 1px solid #e4e6ea;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  min-height: 0;  /* permite que el hijo .ur-kanban__cards haga overflow */
}

.ur-kanban__col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 16px;
  border-bottom: 1px solid #e4e6ea;
  background: #f4f5f7;
  flex-shrink: 0;
}
.ur-kanban__col-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: #44546f;
}
.ur-kanban__col-count {
  background: #dfe1e6;
  border-radius: 20px;
  padding: 1px 9px;
  font-size: 11px;
  font-weight: 700;
  color: #44546f;
}

.ur-kanban__cards {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  transition: background .15s;
}
.ur-kanban__cards--over {
  background: #e8f0fe;
  outline: 2px dashed #4040c8;
  outline-offset: -4px;
  border-radius: 0 0 14px 14px;
}

.ur-kanban__card {
  background: #fff;
  border-radius: 10px;
  padding: 13px;
  cursor: grab;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  border: 1px solid #e4e6ea;
  transition: box-shadow .15s, opacity .15s;
  user-select: none;
}
.ur-kanban__card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.14); }
.ur-kanban__card:active { cursor: grabbing; }
.ur-kanban__card--dragging { opacity: .4; }

.ur-kanban__card-desc {
  font-size: 12px;
  color: #172b4d;
  margin: 7px 0 5px;
  line-height: 1.55;
}
.ur-kanban__card-meta {
  font-size: 11px;
  color: #6c757d;
  margin: 0;
}
.ur-kanban__empty {
  font-size: 12px;
  color: #b0bec5;
  text-align: center;
  padding: 24px 0 16px;
  margin: 0;
  line-height: 1.8;
}
</style>

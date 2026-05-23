<template>
  <div>
    <Navigation />

    <div class="ur-detail">
      <div class="ur-detail__back">
        <nuxt-link to="/user-reports"><i class="fas fa-chevron-left"></i> Volver a reportes</nuxt-link>
      </div>

      <Loading v-if="loading" />

      <div v-if="!loading && report" class="ur-detail__body">
        <!-- Media preview (solo si hay adjunto) -->
        <div v-if="report.capture_type" class="ur-detail__media">
          <img v-if="report.capture_type === 'screenshot'" :src="report.file_url" alt="Screenshot" />
          <video v-else :src="report.file_url" controls></video>
          <a class="ur-detail__download" :href="report.file_url" download target="_blank">
            <i class="fas fa-download"></i> Descargar archivo
          </a>
        </div>

        <!-- Info panel -->
        <div class="ur-detail__info">
          <!-- Tipo -->
          <div class="ur-detail__info-row">
            <span class="ur-detail__info-label">Tipo de reporte</span>
            <span :class="['ur-badge', `ur-badge--${report.report_type}`]">{{ typeLabel(report.report_type) }}</span>
          </div>

          <!-- Rating (feedback) -->
          <div v-if="report.rating" class="ur-detail__info-row">
            <span class="ur-detail__info-label">Calificación</span>
            <div class="ur-detail__stars">
              <i
                v-for="n in 5"
                :key="n"
                :class="['fas fa-star', n <= report.rating ? 'ur-detail__star--active' : 'ur-detail__star--empty']"
              ></i>
            </div>
          </div>

          <!-- Status -->
          <div class="ur-detail__info-row">
            <span class="ur-detail__info-label">Status</span>
            <select v-model="selectedStatus" class="ur-detail__status-select" @change="onStatusChange">
              <option v-for="s in availableStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>

          <!-- Nota de resolución (aparece al seleccionar status terminal) -->
          <div v-if="showResolutionNote" class="ur-detail__info-row">
            <span class="ur-detail__info-label">Nota para el estudiante (opcional)</span>
            <textarea
              v-model="resolutionNote"
              class="ur-detail__note-input"
              placeholder="Escribe aquí la respuesta o explicación para el estudiante..."
              rows="3"
            ></textarea>
            <button class="ur-detail__save-btn" :disabled="saving" @click="saveStatus">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'Guardando…' : 'Guardar y notificar al estudiante' }}
            </button>
          </div>

          <!-- Usuario -->
          <div class="ur-detail__info-row">
            <span class="ur-detail__info-label">Usuario</span>
            <span v-if="report.student_id">
              {{ report.student_id.name }} {{ report.student_id.last_name }}<br />
              <small>{{ report.student_id.email }}</small>
            </span>
          </div>

          <!-- Descripción -->
          <div class="ur-detail__info-row">
            <span class="ur-detail__info-label">Descripción</span>
            <span>{{ report.description }}</span>
          </div>

          <!-- Nota de resolución ya guardada -->
          <div v-if="report.resolution_note" class="ur-detail__info-row">
            <span class="ur-detail__info-label">Nota enviada</span>
            <span class="ur-detail__note-saved">{{ report.resolution_note }}</span>
          </div>

          <!-- Link a ClickUp -->
          <div v-if="report.clickup_task_id" class="ur-detail__info-row">
            <span class="ur-detail__info-label">ClickUp</span>
            <a
              :href="`https://app.clickup.com/t/${report.clickup_task_id}`"
              target="_blank"
              rel="noopener"
              class="ur-detail__clickup-link"
            >
              <i class="fas fa-external-link-alt"></i>
              Ver tarea en ClickUp
            </a>
          </div>

          <!-- Metadatos colapsables -->
          <details class="ur-detail__meta">
            <summary>Metadatos técnicos</summary>
            <ul>
              <li><b>URL:</b> {{ report.page_url }}</li>
              <li><b>Navegador:</b> {{ report.user_agent }}</li>
              <li><b>Resolución:</b> {{ report.screen_width }}×{{ report.screen_height }}</li>
              <li><b>Fecha:</b> {{ report.created_at | formatDate }}</li>
            </ul>
          </details>
        </div>
      </div>

      <p v-if="!loading && !report" class="text-center mt-5">Reporte no encontrado.</p>
    </div>
  </div>
</template>

<script>
import Navigation from '@/components/navs/navigation.vue';
import Loading from '@/components/modals/loading.modal.vue';

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

const RESOLUTION_STATUSES = { bug: 'resuelto', suggestion: 'desplegado', feedback: 'leido' };

export default {
  components: { Navigation, Loading },
  filters: {
    formatDate (val) {
      if (!val) { return ''; }
      return new Date(val).toLocaleString('es-MX');
    },
  },
  data () {
    return {
      loading: false,
      saving: false,
      report: null,
      selectedStatus: '',
      resolutionNote: '',
      pendingResolution: false,
    };
  },
  computed: {
    availableStatuses () {
      if (!this.report) { return []; }
      return STATUS_MAP[this.report.report_type] || [];
    },
    showResolutionNote () {
      if (!this.report) { return false; }
      return this.selectedStatus === RESOLUTION_STATUSES[this.report.report_type] && this.pendingResolution;
    },
  },
  async created () {
    await this.fetchReport();
  },
  methods: {
    async fetchReport () {
      this.loading = true;
      try {
        const res = await this.$axios.get(`/user-reports/${this.$route.params.id}`);
        this.report = res.data.data;
        this.selectedStatus = this.report.status;
        this.resolutionNote = this.report.resolution_note || '';
      } catch (err) { console.error(err); }
      finally { this.loading = false; }
    },
    onStatusChange () {
      const resolutionStatus = RESOLUTION_STATUSES[this.report.report_type];
      if (this.selectedStatus === resolutionStatus) {
        this.pendingResolution = true;
      } else {
        this.pendingResolution = false;
        this.saveStatus();
      }
    },
    async saveStatus () {
      this.saving = true;
      try {
        await this.$axios.patch(`/user-reports/${this.report._id}/status`, {
          status: this.selectedStatus,
          resolution_note: this.resolutionNote || undefined,
        });
        this.report.status = this.selectedStatus;
        this.report.resolution_note = this.resolutionNote;
        this.pendingResolution = false;
      } catch (err) { console.error(err); }
      finally { this.saving = false; }
    },
    typeLabel (type) {
      return { bug: '🐛 Bug', suggestion: '💡 Sugerencia', feedback: '⭐ Feedback' }[type] || type;
    },
  },
};
</script>

<style scoped>
.ur-detail { padding: 28px 32px; font-family: Montserrat, sans-serif; }
.ur-detail__back { margin-bottom: 20px; font-size: 14px; }
.ur-detail__back a { color: #1ca4fc; text-decoration: none; }

.ur-detail__body {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
}

.ur-detail__media img,
.ur-detail__media video {
  width: 100%; border-radius: 8px; background: #000;
  max-height: 480px; object-fit: contain;
}
.ur-detail__download {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 10px;
  padding: 7px 14px; background: #212529; color: #fff; border-radius: 8px;
  font-size: 13px; text-decoration: none;
}
.ur-detail__download:hover { background: #444; color: #fff; }

.ur-detail__info {
  background: #f8f9fa; border-radius: 10px; padding: 20px;
  display: flex; flex-direction: column; gap: 16px;
}
.ur-detail__info-row { display: flex; flex-direction: column; gap: 6px; }
.ur-detail__info-label {
  font-size: 11px; text-transform: uppercase; letter-spacing: .8px;
  color: #888; font-weight: 700;
}

.ur-badge {
  display: inline-flex; align-items: center; padding: 3px 10px;
  border-radius: 20px; font-size: 12px; font-weight: 600;
  width: fit-content;
}
.ur-badge--bug       { background: #ffebee; color: #c62828; }
.ur-badge--suggestion{ background: #fffde7; color: #f57f17; }
.ur-badge--feedback  { background: #fff8e1; color: #f9a825; }

/* Stars */
.ur-detail__stars { display: flex; gap: 4px; }
.ur-detail__star--active { color: #fe9400; }
.ur-detail__star--empty  { color: #dee2e6; }

.ur-detail__status-select {
  border: 1px solid #dee2e6; border-radius: 6px; padding: 6px 10px;
  font-size: 13px; width: 100%;
}

.ur-detail__note-input {
  width: 100%; border: 1px solid #dee2e6; border-radius: 8px;
  padding: 8px 12px; font-size: 13px; font-family: inherit;
  resize: vertical; box-sizing: border-box;
}
.ur-detail__note-input:focus { outline: none; border-color: #fe9400; }

.ur-detail__save-btn {
  padding: 9px 16px; border: none; border-radius: 8px; background: #fe9400;
  color: #fff; font-weight: 700; font-size: 13px; cursor: pointer;
  transition: background .15s; display: flex; align-items: center; gap: 6px;
}
.ur-detail__save-btn:hover:not(:disabled) { background: #e07d00; }
.ur-detail__save-btn:disabled { opacity: .6; cursor: not-allowed; }

.ur-detail__clickup-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #7b68ee;
  text-decoration: none;
  font-weight: 600;
}
.ur-detail__clickup-link:hover { text-decoration: underline; color: #6254d4; }

.ur-detail__note-saved {
  font-size: 13px; color: #333; background: #fff; border-left: 3px solid #fe9400;
  padding: 8px 12px; border-radius: 4px;
}

.ur-detail__meta { font-size: 13px; color: #555; }
.ur-detail__meta ul { padding-left: 16px; margin-top: 8px; line-height: 1.8; }
</style>

<template>
  <div class="log-modal-overlay" @click.self="$emit('close')">
    <div class="log-modal">
      <div class="log-modal-header">
        <h5>Detalle del log</h5>
        <button class="close-btn" type="button" @click="$emit('close')">x</button>
      </div>

      <div class="log-modal-body">
        <div class="meta-grid">
          <div><strong>ID:</strong> {{ log._id || '-' }}</div>
          <div><strong>Tipo:</strong> {{ logTypeLabel }}</div>
          <div><strong>Usuario:</strong> {{ userName }}</div>
          <div><strong>User ID:</strong> {{ log.user_id || '-' }}</div>
          <div><strong>IP:</strong> {{ log.ip_address || '-' }}</div>
          <div><strong>User-Agent:</strong> {{ log.user_agent || '-' }}</div>
          <div><strong>Fecha:</strong> {{ formattedDate(log.created_at) }}</div>
        </div>

        <div class="payload-container">
          <p class="payload-title">Payload (JSON)</p>
          <pre class="json-viewer">{{ payloadString }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    log: {
      type: Object,
      required: true,
    },
  },
  computed: {
    userName() {
      if (!this.log || !this.log.user) return '-';
      return this.log.user.name || this.log.user.email || '-';
    },
    payloadString() {
      if (!this.log || !this.log.payload) {
        return '{}';
      }
      try {
        return JSON.stringify(this.log.payload, null, 2);
      } catch (error) {
        return '{"error":"No se pudo renderizar el payload"}';
      }
    },
    logTypeLabel() {
      if (!this.log || !this.log.log_type) return '-';
      const map = {
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
      };
      return map[this.log.log_type] || this.log.log_type;
    },
  },
  methods: {
    formattedDate(value) {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return date.toLocaleString();
    },
  },
};
</script>

<style scoped>
.log-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.log-modal {
  background: #ffffff;
  width: 90%;
  max-width: 920px;
  max-height: 85vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.log-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.log-modal-header h5 {
  margin: 0;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.log-modal-body {
  padding: 18px 20px;
  overflow: auto;
}

.meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
}

.payload-title {
  margin: 0 0 8px;
  font-weight: 600;
}

.json-viewer {
  background: #121826;
  color: #d9e6ff;
  padding: 14px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  max-height: 350px;
  overflow: auto;
}

@media (max-width: 768px) {
  .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>

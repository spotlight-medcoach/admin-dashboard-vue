<template>
  <div class="conversion-status">
    <div v-if="status || imageRegenerationStatus" class="status-container">
      <!-- Estado de conversión -->
      <b-badge v-if="status" :variant="statusVariant" :class="statusClass">
        <b-spinner
          v-if="status.status === 'pending' || status.status === 'processing'"
          small
        ></b-spinner>
        <i class="fas fa-file-alt"></i>
        {{ statusText }}
        <span v-if="status.progress !== undefined && status.progress > 0">
          ({{ status.progress }}%)
        </span>
      </b-badge>
      <!-- Estado de regeneración de imágenes -->
      <b-badge
        v-if="imageRegenerationStatus"
        :variant="imageRegenerationVariant"
        :class="imageRegenerationClass"
      >
        <b-spinner
          v-if="
            imageRegenerationStatus.status === 'pending' ||
            imageRegenerationStatus.status === 'processing'
          "
          small
        ></b-spinner>
        <i class="fas fa-images"></i>
        {{ imageRegenerationText }}
      </b-badge>
    </div>
    <span v-else class="text-muted">-</span>
  </div>
</template>

<script>
export default {
  name: 'ConversionStatus',
  props: {
    status: {
      type: Object,
      default: null,
    },
    imageRegenerationStatus: {
      type: Object,
      default: null,
    },
  },
  computed: {
    statusText() {
      if (!this.status) return '-';

      const statusMap = {
        pending: 'Pendiente',
        processing: 'Procesando',
        completed: 'Completado',
        failed: 'Fallido',
      };

      return statusMap[this.status.status] || this.status.status;
    },
    statusVariant() {
      if (!this.status) return 'secondary';

      const variantMap = {
        pending: 'warning',
        processing: 'info',
        completed: 'success',
        failed: 'danger',
      };

      return variantMap[this.status.status] || 'secondary';
    },
    statusClass() {
      if (!this.status) return '';

      return {
        'conversion-pending': this.status.status === 'pending',
        'conversion-processing': this.status.status === 'processing',
        'conversion-completed': this.status.status === 'completed',
        'conversion-failed': this.status.status === 'failed',
      };
    },
    imageRegenerationText() {
      if (!this.imageRegenerationStatus) return '';

      const statusMap = {
        pending: 'Imágenes pendientes',
        processing: 'Regenerando imágenes',
        completed: 'Imágenes completadas',
        failed: 'Imágenes fallidas',
      };

      return (
        statusMap[this.imageRegenerationStatus.status] ||
        this.imageRegenerationStatus.status
      );
    },
    imageRegenerationVariant() {
      if (!this.imageRegenerationStatus) return 'secondary';

      const variantMap = {
        pending: 'warning',
        processing: 'info',
        completed: 'success',
        failed: 'danger',
      };

      return variantMap[this.imageRegenerationStatus.status] || 'secondary';
    },
    imageRegenerationClass() {
      if (!this.imageRegenerationStatus) return '';

      return {
        'image-regeneration-pending':
          this.imageRegenerationStatus.status === 'pending',
        'image-regeneration-processing':
          this.imageRegenerationStatus.status === 'processing',
        'image-regeneration-completed':
          this.imageRegenerationStatus.status === 'completed',
        'image-regeneration-failed':
          this.imageRegenerationStatus.status === 'failed',
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.conversion-status {
  display: inline-flex;
  align-items: center;

  .status-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }

  .badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    white-space: nowrap;

    i {
      font-size: 0.7rem;
    }
  }

  .conversion-processing,
  .image-regeneration-processing {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>

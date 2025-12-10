<template>
  <div class="conversion-status">
    <b-badge v-if="status" :variant="statusVariant" :class="statusClass">
      <b-spinner
        v-if="status.status === 'pending' || status.status === 'processing'"
        small
      ></b-spinner>
      {{ statusText }}
      <span v-if="status.progress !== undefined && status.progress > 0">
        ({{ status.progress }}%)
      </span>
    </b-badge>
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
  },
};
</script>

<style lang="scss" scoped>
.conversion-status {
  display: inline-flex;
  align-items: center;

  .badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
  }

  .conversion-processing {
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

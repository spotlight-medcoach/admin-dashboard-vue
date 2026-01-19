<template>
  <b-card v-if="status.total > 0" class="mb-3" no-body>
    <b-card-header class="d-flex justify-content-between align-items-center">
      <h5 class="mb-0">
        <i class="fas fa-envelope"></i> Estado de Envío de Correos
      </h5>
      <b-button
        variant="link"
        size="sm"
        class="close-btn"
        @click="$emit('close')"
      >
        <i class="fas fa-times"></i>
      </b-button>
    </b-card-header>
    <b-card-body>
      <div class="row">
        <div class="col-md-3">
          <div class="text-center">
            <h3 class="text-info">{{ status.pending }}</h3>
            <p class="mb-0">Pendientes</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h3 class="text-success">{{ status.sent }}</h3>
            <p class="mb-0">Enviados</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h3 class="text-danger">{{ status.failed }}</h3>
            <p class="mb-0">Fallidos</p>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h3 class="text-primary">{{ status.total }}</h3>
            <p class="mb-0">Total</p>
          </div>
        </div>
      </div>
      <b-progress :max="status.total" class="mt-3" show-value>
        <b-progress-bar
          :value="status.sent"
          variant="success"
          :label="`${Math.round((status.sent / status.total) * 100)}%`"
        ></b-progress-bar>
        <b-progress-bar
          :value="status.failed"
          variant="danger"
          :label="`${Math.round((status.failed / status.total) * 100)}%`"
        ></b-progress-bar>
      </b-progress>
    </b-card-body>
  </b-card>
</template>

<script>
export default {
  name: 'EmailQueueStatus',
  props: {
    status: {
      type: Object,
      required: true,
      default: () => ({
        pending: 0,
        sent: 0,
        failed: 0,
        total: 0,
      }),
    },
  },
  emits: ['close'],
};
</script>

<style lang="scss" scoped>
.close-btn {
  color: #6c757d;
  padding: 0;
  line-height: 1;

  &:hover {
    color: #495057;
  }

  &:focus {
    box-shadow: none;
  }
}
</style>

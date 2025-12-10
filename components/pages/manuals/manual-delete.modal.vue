<template>
  <b-modal
    id="manual-delete-modal"
    ref="manual-delete-modal"
    title="Eliminar Manual"
    cancel-title="Cancelar"
    ok-title="Eliminar"
    ok-variant="danger"
    cancel-variant="light"
    centered
    @ok="deleteManual"
  >
    <p>¿Estás seguro de que deseas eliminar este manual?</p>
    <p class="text-muted">
      Esta acción no se puede deshacer.
    </p>
  </b-modal>
</template>

<script>
export default {
  name: "ManualDeleteModal",
  props: {
    selectedManualId: {
      type: String,
      default: null,
    },
  },
  methods: {
    async deleteManual() {
      if (!this.selectedManualId) return;

      try {
        await this.$store.dispatch(
          "manuals/deleteManual",
          this.selectedManualId
        );
        this.$emit("onDelete");
        this.$refs["manual-delete-modal"].hide();
        this.$bvToast.toast("Manual eliminado exitosamente", {
          title: "Éxito",
          variant: "success",
          solid: true,
        });
        // Recargar listado
        await this.$store.dispatch("manuals/fetchManuals");
      } catch (error) {
        console.error("Error deleting manual:", error);
        this.$bvToast.toast("Error al eliminar el manual", {
          title: "Error",
          variant: "danger",
          solid: true,
        });
      }
    },
  },
};
</script>

<style scoped>
</style>


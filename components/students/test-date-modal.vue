<template>
  <b-modal
    id="test-date-modal-detail"
    v-model="showModal"
    title="Modificar fecha de examen"
    @hidden="onHidden"
  >
    <b-form-group
      label="Nueva fecha de examen"
      label-for="test-date-input"
    >
      <b-form-input
        id="test-date-input"
        v-model="testDateForm"
        type="date"
        required
        :min="minTestDate"
      />
      <small class="form-text text-muted">
        La fecha debe ser futura. Se recalcularán las horas de estudio
        restando las horas de los manuales ya leídos.
      </small>
    </b-form-group>
    <template #modal-footer>
      <b-button variant="secondary" @click="close">
        Cancelar
      </b-button>
      <b-button
        variant="primary"
        :disabled="!testDateForm || saving"
        @click="saveTestDate"
      >
        <span v-if="saving">Guardando...</span>
        <span v-else>Guardar</span>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: 'TestDateModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    studentId: {
      type: String,
      default: '',
    },
    currentTestDate: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      testDateForm: '',
      saving: false,
    };
  },
  computed: {
    showModal: {
      get() {
        return this.show;
      },
      set(val) {
        if (!val) {
          this.$emit('close');
        }
      },
    },
    minTestDate() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().slice(0, 10);
    },
  },
  watch: {
    show(newVal) {
      if (newVal && this.currentTestDate) {
        try {
          this.testDateForm = new Date(this.currentTestDate)
            .toISOString()
            .slice(0, 10);
        } catch {
          this.testDateForm = '';
        }
      }
    },
  },
  methods: {
    close() {
      this.$emit('close');
    },
    onHidden() {
      this.testDateForm = '';
      this.$emit('close');
    },
    async saveTestDate() {
      if (!this.studentId || !this.testDateForm) return;
      this.saving = true;
      try {
        await this.$store.dispatch('students/updateTestDate', {
          studentId: this.studentId,
          testDate: this.testDateForm,
        });
        this.$bvToast.toast(
          'Fecha de examen y año actualizados. Horas de estudio recalculadas.',
          {
            title: 'Éxito',
            variant: 'success',
            solid: true,
          }
        );
        this.$emit('saved');
      } catch (error) {
        console.error('Error updating test date:', error);
        this.$bvToast.toast(
          (error.response && error.response.data && error.response.data.error) ||
            'Error al actualizar fecha de examen',
          {
            title: 'Error',
            variant: 'danger',
            solid: true,
          }
        );
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

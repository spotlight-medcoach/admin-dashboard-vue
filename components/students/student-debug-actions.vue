<template>
  <div class="debug-actions">
    <div class="debug-header">
      <i class="fas fa-tools"></i>
      <h3>Acciones de administración</h3>
    </div>
    <div class="debug-actions-grid">
      <button
        class="debug-action-btn"
        :disabled="loadingAction === 'medscore'"
        @click="recalculateMedScore"
      >
        <i
          class="fas"
          :class="loadingAction === 'medscore' ? 'fa-spinner fa-spin' : 'fa-calculator'"
        ></i>
        <span>Recalcular MedScore</span>
      </button>

      <button
        class="debug-action-btn"
        :disabled="loadingAction === 'email'"
        @click="resendWelcomeEmail"
      >
        <i
          class="fas"
          :class="loadingAction === 'email' ? 'fa-spinner fa-spin' : 'fa-envelope'"
        ></i>
        <span>Reenviar correo de bienvenida</span>
      </button>

      <button
        class="debug-action-btn"
        :disabled="loadingAction === 'syllabus'"
        @click="regenerateSyllabus"
      >
        <i
          class="fas"
          :class="loadingAction === 'syllabus' ? 'fa-spinner fa-spin' : 'fa-sync-alt'"
        ></i>
        <span>Reiniciar plan de estudios</span>
      </button>

      <button
        class="debug-action-btn"
        :disabled="loadingAction === 'testdate'"
        @click="openTestDateModal"
      >
        <i class="fas fa-calendar-alt"></i>
        <span>Modificar fecha de examen</span>
      </button>

      <button
        class="debug-action-btn"
        :disabled="loadingAction === 'diagnostic'"
        @click="generateDiagnosticTest"
      >
        <i
          class="fas"
          :class="loadingAction === 'diagnostic' ? 'fa-spinner fa-spin' : 'fa-file-medical'"
        ></i>
        <span>Generar examen de diagnóstico</span>
      </button>

      <button
        class="debug-action-btn"
        :disabled="loadingAction === 'progress'"
        @click="initializeProgress"
      >
        <i
          class="fas"
          :class="loadingAction === 'progress' ? 'fa-spinner fa-spin' : 'fa-redo'"
        ></i>
        <span>Inicializar progreso</span>
      </button>
    </div>

    <TestDateModal
      :show="showTestDateModal"
      :student-id="studentId"
      :current-test-date="currentTestDate"
      @close="showTestDateModal = false"
      @saved="onTestDateSaved"
    />
  </div>
</template>

<script>
import TestDateModal from '@/components/students/test-date-modal.vue';

export default {
  name: 'StudentDebugActions',
  components: {
    TestDateModal,
  },
  props: {
    studentId: {
      type: String,
      required: true,
    },
    currentTestDate: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loadingAction: null,
      showTestDateModal: false,
    };
  },
  methods: {
    async recalculateMedScore() {
      this.loadingAction = 'medscore';
      try {
        await this.$store.dispatch(
          'students/recalculateMedScore',
          this.studentId
        );
        this.$bvToast.toast('MedScore recalculado exitosamente', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
        this.$emit('action-completed');
      } catch (error) {
        console.error('Error recalculating MedScore:', error);
        this.$bvToast.toast('Error al recalcular MedScore', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loadingAction = null;
      }
    },

    async resendWelcomeEmail() {
      this.loadingAction = 'email';
      try {
        await this.$store.dispatch(
          'students/resendWelcomeEmail',
          this.studentId
        );
        this.$bvToast.toast('Correo de bienvenida reenviado exitosamente', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
      } catch (error) {
        console.error('Error resending welcome email:', error);
        this.$bvToast.toast('Error al reenviar correo de bienvenida', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loadingAction = null;
      }
    },

    async regenerateSyllabus() {
      this.loadingAction = 'syllabus';
      try {
        await this.$store.dispatch(
          'students/regenerateSyllabus',
          this.studentId
        );
        this.$bvToast.toast('Regeneración de plan de estudios iniciada', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
        this.$emit('action-completed');
      } catch (error) {
        console.error('Error regenerating syllabus:', error);
        this.$bvToast.toast('Error al regenerar plan de estudios', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loadingAction = null;
      }
    },

    openTestDateModal() {
      this.showTestDateModal = true;
    },

    onTestDateSaved() {
      this.showTestDateModal = false;
      this.$emit('action-completed');
    },

    async generateDiagnosticTest() {
      this.loadingAction = 'diagnostic';
      try {
        await this.$store.dispatch(
          'students/generateDiagnosticTest',
          this.studentId
        );
        this.$bvToast.toast(
          'Generación de examen de diagnóstico encolada exitosamente',
          {
            title: 'Éxito',
            variant: 'success',
            solid: true,
          }
        );
      } catch (error) {
        console.error('Error generating diagnostic test:', error);
        this.$bvToast.toast('Error al generar examen de diagnóstico', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loadingAction = null;
      }
    },

    async initializeProgress() {
      this.loadingAction = 'progress';
      try {
        await this.$store.dispatch(
          'students/initializeStudentProgress',
          this.studentId
        );
        this.$bvToast.toast(
          'Progreso del estudiante inicializado exitosamente',
          {
            title: 'Éxito',
            variant: 'success',
            solid: true,
          }
        );
        this.$emit('action-completed');
      } catch (error) {
        console.error('Error initializing student progress:', error);
        this.$bvToast.toast('Error al inicializar progreso del estudiante', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.loadingAction = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.debug-actions {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  border-left: 4px solid #ff9300;
}

.debug-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  i {
    font-size: 18px;
    color: #ff9300;
  }

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1b;
    margin: 0;
  }
}

.debug-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.debug-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #f8f8f8;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1b;
  text-align: left;

  i {
    font-size: 15px;
    color: #ff9300;
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  &:hover:not(:disabled) {
    background: #fff3e0;
    border-color: #ff9300;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(255, 147, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@media (max-width: 992px) {
  .debug-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .debug-actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>

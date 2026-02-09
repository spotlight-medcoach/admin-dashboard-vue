<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ isEdit ? 'Editar Profesor' : 'Agregar Profesor' }}</h3>
        <button class="btn-close-modal" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Nombre <span class="required">*</span></label>
          <input
            v-model="form.name"
            type="text"
            class="form-input"
            placeholder="Nombre"
          />
        </div>

        <div class="form-group">
          <label>Apellido <span class="required">*</span></label>
          <input
            v-model="form.last_name"
            type="text"
            class="form-input"
            placeholder="Apellido"
          />
        </div>

        <div class="form-group">
          <label>Correo electrónico <span class="required">*</span></label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div v-if="!isEdit" class="form-group">
          <label>Contraseña <span class="required">*</span></label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="••••••••"
          />
        </div>

        <div class="form-group">
          <label>Universidad <span class="required">*</span></label>
          <select v-model="form.university_id" class="form-select">
            <option value="">Seleccionar universidad</option>
            <option
              v-for="uni in universities"
              :key="uni._id"
              :value="uni._id"
            >
              {{ uni.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-cancel" @click="$emit('close')">
          Cancelar
        </button>
        <button
          class="btn btn-save"
          :disabled="!isValid || saving"
          @click="save"
        >
          <div v-if="saving" class="spinner-small"></div>
          <span v-else>{{ isEdit ? 'Guardar cambios' : 'Crear profesor' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    professor: {
      type: Object,
      default: null,
    },
    universities: {
      type: Array,
      default: () => [],
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: {
        name: '',
        last_name: '',
        email: '',
        password: '',
        university_id: '',
      },
    };
  },
  computed: {
    isEdit() {
      return !!this.professor;
    },
    isValid() {
      if (!this.form.name || !this.form.last_name || !this.form.email || !this.form.university_id) {
        return false;
      }
      if (!this.isEdit && !this.form.password) {
        return false;
      }
      return true;
    },
  },
  created() {
    if (this.professor) {
      this.form.name = this.professor.name || '';
      this.form.last_name = this.professor.last_name || '';
      this.form.email = this.professor.email || '';
      this.form.university_id =
        this.professor.university_id?._id || this.professor.university_id || '';
    }
  },
  methods: {
    save() {
      if (!this.isValid) return;
      this.$emit('save', { ...this.form });
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background: #fff;
  border-radius: 16px;
  width: 500px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  font-family: Montserrat, sans-serif;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #212529;
}

.btn-close-modal {
  background: none;
  border: none;
  font-size: 18px;
  color: #6c757d;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #f8f9fa;
  color: #212529;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 6px;
}

.required {
  color: #dc3545;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d4d5d7;
  border-radius: 8px;
  font-size: 14px;
  font-family: Montserrat, sans-serif;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  border-color: #fe9400;
}

.form-select {
  appearance: none;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23333'><polygon points='0,0 100,0 50,50'/></svg>")
    no-repeat;
  background-size: 12px;
  background-position: calc(100% - 14px) center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: Montserrat, sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f8f9fa;
  color: #495057;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-save {
  background: #fe9400;
  color: #fff;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save:hover:not(:disabled) {
  background: #e08500;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

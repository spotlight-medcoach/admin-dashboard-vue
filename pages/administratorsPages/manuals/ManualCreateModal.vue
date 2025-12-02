<template>
  <b-modal
    id="manual-create-modal"
    ref="manual-create-modal"
    title="Sube tu Manual"
    cancel-title="Cancelar"
    ok-title="Guardar Manual"
    cancel-variant="light"
    header-class="mt-4"
    title-class="w-100 pl-5 text-center"
    body-class="px-5 pb-0"
    footer-class="px-5 pb-5"
    centered
    @shown="loaded = true"
    @hidden="loaded = false"
  >
    <template #modal-header-close>
      <b-icon icon="x" font-scale="1.1" />
    </template>
    <b-form id="manual-form" name="manual-form" @submit="createManual">
      <b-form-group label="Nombre" label-for="name">
        <b-form-input
          id="name"
          v-model="form.name"
          placeholder="Nombre del Manual"
          required
          :disabled="isUploading"
        />
      </b-form-group>
      <b-form-group label="Tema" label-for="topic">
        <b-form-select
          id="topic"
          v-model="form.topic"
          :options="topicOptions"
          required
          :disabled="isUploading"
        />
      </b-form-group>
      <b-form-group label="Subtema" label-for="subtopic">
        <b-form-select
          id="subtopic"
          v-model="form.subtopic"
          :options="subtopicOptions"
          :disabled="form.topic === null || isUploading"
          required
        />
      </b-form-group>
      <b-form-group
        label="Tiempo de Lectura (minutos)"
        label-for="reading_time"
      >
        <b-form-input
          id="reading_time"
          v-model.number="form.reading_time"
          type="number"
          min="1"
          placeholder="Ej: 15"
          required
          :disabled="isUploading"
        />
        <small class="text-muted mt-1 d-block">
          Tiempo estimado de lectura en minutos
        </small>
      </b-form-group>
      <b-form-group label="Importancia" label-for="importance">
        <b-form-select
          id="importance"
          v-model.number="form.importance"
          :options="importanceOptions"
          required
          :disabled="isUploading"
        />
      </b-form-group>
      <b-form-group label="Archivo .docx" label-for="file">
        <b-form-file
          id="file"
          v-model="form.file"
          accept=".docx"
          placeholder="Selecciona un archivo .docx"
          drop-placeholder="Arrastra un archivo .docx aquí"
          :disabled="isUploading"
          @change="onFileChange"
        />
        <small v-if="form.file" class="text-muted mt-2 d-block">
          Archivo seleccionado: {{ form.file.name }}
        </small>
        <small v-if="!form.file" class="text-muted mt-2 d-block">
          Solo se permiten archivos .docx
        </small>
      </b-form-group>
      <div v-if="isUploading" class="upload-progress mt-3">
        <div class="text-center">
          <b-spinner variant="primary" label="Subiendo..."></b-spinner>
          <p class="mt-2">Subiendo archivo, por favor espera...</p>
        </div>
      </div>
    </b-form>
    <template #modal-footer>
      <b-button
        type="submit"
        form="manual-form"
        variant="primary"
        :disabled="
          !form.file ||
          !form.name ||
          !form.topic ||
          !form.subtopic ||
          !form.reading_time ||
          !form.importance ||
          isUploading
        "
      >
        <span v-if="!isUploading">Guardar Manual</span>
        <span v-else> <b-spinner small></b-spinner> Subiendo... </span>
      </b-button>
    </template>
  </b-modal>
</template>

<script>
const formDefault = {
  name: '',
  topic: null,
  subtopic: null,
  reading_time: null,
  importance: null,
  file: null,
};

export default {
  name: 'ManualCreateModal',
  data() {
    return {
      loaded: false,
      isUploading: false,
      topics: [],
      form: {
        name: '',
        topic: null,
        subtopic: null,
        reading_time: null,
        importance: null,
        file: null,
      },
    };
  },
  computed: {
    topicOptions() {
      const initial = [
        { text: '-- Tema del manual', value: null, disabled: true },
      ];
      return initial.concat(
        this.topics.map((topic) => {
          return { text: topic.name, value: topic };
        })
      );
    },
    subtopicOptions() {
      const initial = [
        { text: '-- Subtema del manual', value: null, disabled: true },
      ];
      if (this.form.topic === null) {
        return initial;
      }
      return initial.concat(
        this.form.topic.subtopics.map((subtopic) => {
          return { text: subtopic.name, value: subtopic };
        })
      );
    },
    importanceOptions() {
      return [
        { text: '-- Importancia del manual', value: null, disabled: true },
        { text: 'Alta', value: 1 },
        { text: 'Media', value: 2 },
        { text: 'Baja', value: 3 },
      ];
    },
  },
  async created() {
    if (process.browser) {
      this.topics = JSON.parse(localStorage.getItem('topics')) || [];
    }
  },
  mounted() {
    this.form = Object.assign({}, formDefault);
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar que sea .docx
        if (
          !file.name.endsWith('.docx') &&
          file.type !==
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          this.$bvToast.toast('Solo se permiten archivos .docx', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          this.form.file = null;
          return;
        }
        this.form.file = file;
      } else {
        this.form.file = null;
      }
    },
    async createManual(event) {
      event.preventDefault();
      if (!this.form.file) {
        this.$bvToast.toast('Debes seleccionar un archivo .docx', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
        return;
      }

      this.isUploading = true;
      try {
        const data = await this.$store.dispatch('manuals/createManual', {
          name: this.form.name,
          topic_id: this.form.topic._id,
          subtopic_id: this.form.subtopic._id,
          reading_time: this.form.reading_time,
          importance: this.form.importance,
          file: this.form.file,
        });

        if (data && !data.response) {
          // Éxito
          const manualId = data.id || data._id;

          // Iniciar tracking de conversión si hay un manualId
          if (manualId) {
            this.$store.dispatch('manuals/startConversionTracking', manualId);
          }

          this.form = Object.assign({}, formDefault);
          this.$emit('onCreate');
          this.$refs['manual-create-modal'].hide();
          this.$bvToast.toast(
            'Manual creado exitosamente. La conversión está en proceso.',
            {
              title: 'Éxito',
              variant: 'success',
              solid: true,
            }
          );
          // Recargar listado
          await this.$store.dispatch('manuals/fetchManuals');
        } else {
          // Error
          this.$bvToast.toast(
            data.response?.data?.message || 'Error al crear el manual',
            {
              title: 'Error',
              variant: 'danger',
              solid: true,
            }
          );
        }
      } catch (error) {
        console.error('Error creating manual:', error);
        this.$bvToast.toast('Error al crear el manual', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isUploading = false;
      }
    },
  },
};
</script>

<style lang="scss">
#manual-create-modal {
  #manual-form {
    max-width: 100%;
  }
  .modal-content {
    border: none;
    > * {
      border: none;
    }
  }
  .upload-progress {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
  }
}
</style>

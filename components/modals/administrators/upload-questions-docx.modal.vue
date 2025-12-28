<template>
  <b-modal
    id="upload-questions-docx-modal"
    title="Cargar Preguntas desde DOCX"
    size="lg"
    @hide="resetForm"
  >
    <div v-if="!uploading && !processing">
      <b-form-group
        v-if="questionType === 'diagnostic'"
        label="Número de examen"
        label-for="test-number"
      >
        <b-form-select
          id="test-number"
          v-model="testNumber"
          :options="testNumberOptions"
          required
        />
      </b-form-group>

      <b-form-group label="Archivo DOCX" label-for="docx-file">
        <div
          class="file-drop-area"
          :class="{ 'has-file': selectedFile }"
          @click="triggerFileInput"
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          @dragleave.prevent
        >
          <input
            ref="fileInput"
            type="file"
            accept=".docx"
            style="display: none"
            @change="handleFileChange"
          />
          <i class="fas fa-file-upload"></i>
          <p v-if="!selectedFile">
            Arrastra un archivo DOCX aquí o haz clic para seleccionar
          </p>
          <p v-else class="file-name">{{ selectedFile.name }}</p>
          <small v-if="!selectedFile" class="file-hint"
            >Solo se permiten archivos .docx</small
          >
        </div>
      </b-form-group>
    </div>

    <div v-if="uploading" class="text-center">
      <b-spinner></b-spinner>
      <p class="mt-2">Subiendo archivo...</p>
    </div>

    <div v-if="processing" class="text-center">
      <b-spinner></b-spinner>
      <p class="mt-2">Procesando archivo DOCX...</p>
      <p class="text-muted">Esto puede tomar unos minutos</p>
    </div>

    <div v-if="result" class="mt-3">
      <b-alert :variant="result.success ? 'success' : 'danger'" show>
        <strong>{{ result.message }}</strong>
        <div v-if="result.data">
          <p>Preguntas creadas: {{ result.data.created }}</p>
          <p v-if="result.data.errors && result.data.errors.length > 0">
            Errores: {{ result.data.errors.length }}
          </p>
        </div>
      </b-alert>
    </div>

    <template #modal-footer>
      <b-button
        variant="secondary"
        @click="closeModal"
        :disabled="uploading || processing"
      >
        Cerrar
      </b-button>
      <b-button
        v-if="!uploading && !processing && !result"
        variant="primary"
        @click="uploadAndProcess"
        :disabled="!selectedFile"
      >
        Cargar y Procesar
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  props: {
    questionType: {
      type: String,
      default: 'diagnostic', // diagnostic, custom, simulator
    },
  },
  data() {
    return {
      selectedFile: null,
      uploading: false,
      processing: false,
      result: null,
      testNumber: 1,
      testNumberOptions: [
        { text: 'Diagnóstico 1', value: 1 },
        { text: 'Diagnóstico 2', value: 2 },
      ],
    };
  },
  methods: {
    async uploadAndProcess() {
      if (!this.selectedFile) {
        alert('Por favor selecciona un archivo');
        return;
      }

      try {
        this.uploading = true;
        this.result = null;

        // Step 1: Get presigned URL
        const endpoint =
          this.questionType === 'diagnostic'
            ? '/diagnostic-questions/presigned-url'
            : '/custom-questions/presigned-url';

        const presignedResponse = await this.$axios.post(endpoint, {
          fileName: this.selectedFile.name,
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        const { uploadUrl, fileUrl } =
          presignedResponse.data.data || presignedResponse.data;

        // Step 2: Upload file to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: this.selectedFile,
          headers: {
            'Content-Type':
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Error al subir el archivo a S3');
        }

        this.uploading = false;
        this.processing = true;

        // Step 3: Process DOCX
        const processEndpoint =
          this.questionType === 'diagnostic'
            ? '/diagnostic-questions/upload-docx'
            : '/custom-questions/upload-docx';

        const processData = { file_url: fileUrl };
        if (this.questionType === 'diagnostic') {
          processData.test_number = this.testNumber;
        }

        const processResponse = await this.$axios.post(
          processEndpoint,
          processData
        );

        this.processing = false;
        this.result = {
          success: true,
          message:
            processResponse.data.message || 'Archivo procesado exitosamente',
          data: processResponse.data.data || processResponse.data.payload,
        };

        // Emit event to parent
        this.$emit('onUpload', this.result);
      } catch (error) {
        console.error('Error uploading/processing DOCX:', error);
        this.uploading = false;
        this.processing = false;
        this.result = {
          success: false,
          message:
            error.response?.data?.error ||
            error.message ||
            'Error al procesar el archivo',
        };
      }
    },
    closeModal() {
      this.$bvModal.hide('upload-questions-docx-modal');
      this.resetForm();
    },
    resetForm() {
      this.selectedFile = null;
      this.uploading = false;
      this.processing = false;
      this.result = null;
      this.testNumber = 1;
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
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
          this.selectedFile = null;
          event.target.value = '';
          return;
        }
        this.selectedFile = file;
      } else {
        this.selectedFile = null;
      }
    },
    handleDrop(event) {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
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
          return;
        }
        this.selectedFile = file;
      }
    },
  },
};
</script>

<style scoped>
.text-center {
  text-align: center;
}

.file-drop-area {
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8f9fa;
}

.file-drop-area:hover {
  border-color: #20b000;
  background-color: #f0f9f0;
}

.file-drop-area.has-file {
  border-color: #20b000;
  background-color: #f0f9f0;
}

.file-drop-area i {
  font-size: 48px;
  color: #20b000;
  margin-bottom: 16px;
  display: block;
}

.file-drop-area p {
  margin: 0;
  font-size: 16px;
  color: #212529;
  font-weight: 500;
}

.file-drop-area .file-name {
  color: #20b000;
  word-break: break-all;
}

.file-drop-area .file-hint {
  display: block;
  margin-top: 8px;
  color: #6c757d;
  font-size: 14px;
}
</style>

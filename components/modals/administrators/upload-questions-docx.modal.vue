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

    <div v-if="result" class="mt-3 result-section">
      <b-alert :variant="result.success ? 'success' : 'danger'" show>
        <strong>{{ result.message }}</strong>
        <div v-if="result.data" class="result-summary">
          <p>
            <i class="fas fa-check-circle text-success"></i> Preguntas creadas:
            {{ result.data.created }}
          </p>
          <p v-if="result.data.errors && result.data.errors.length > 0">
            <i class="fas fa-exclamation-triangle text-danger"></i> Errores:
            {{ result.data.errors.length }}
          </p>
        </div>
      </b-alert>

      <!-- Acordeón de preguntas creadas -->
      <div
        v-if="
          result.data &&
          result.data.questions &&
          result.data.questions.length > 0
        "
        class="accordion-section"
      >
        <div
          class="accordion-header"
          :class="{ 'is-open': showCreatedQuestions }"
          @click="showCreatedQuestions = !showCreatedQuestions"
        >
          <span>
            <i class="fas fa-check-circle text-success"></i>
            Preguntas creadas ({{ result.data.questions.length }})
          </span>
          <i
            class="fas"
            :class="showCreatedQuestions ? 'fa-chevron-up' : 'fa-chevron-down'"
          ></i>
        </div>
        <div v-show="showCreatedQuestions" class="accordion-content">
          <div
            v-for="(question, index) in result.data.questions"
            :key="question._id || index"
            class="question-item"
          >
            <div class="question-header">
              <span class="question-id">{{ question.spotlight_id }}</span>
              <span class="question-meta">
                <span v-if="question.topic" class="badge badge-topic">
                  {{ question.topic.name || question.topic }}
                </span>
                <span v-if="question.subtopic" class="badge badge-subtopic">
                  {{ question.subtopic.name || question.subtopic }}
                </span>
                <span
                  v-if="question.difficulty"
                  class="badge badge-difficulty"
                  :class="
                    'difficulty-' + (question.difficulty || '').toLowerCase()
                  "
                >
                  {{ question.difficulty }}
                </span>
              </span>
            </div>
            <div
              class="question-preview"
              v-html="
                truncateHtml(
                  (question.question && question.question.html) || '',
                  150
                )
              "
            ></div>
            <div
              v-if="question.answers && question.answers.length > 0"
              class="question-answers"
            >
              <div
                v-for="(answer, ansIndex) in question.answers"
                :key="answer._id || ansIndex"
                class="answer-item"
                :class="{
                  'correct-answer': ansIndex === question.correct_answer,
                }"
              >
                <span class="answer-letter"
                  >{{ String.fromCharCode(65 + ansIndex) }}.</span
                >
                <span
                  class="answer-text"
                  v-html="truncateHtml(answer.html || '', 100)"
                ></span>
                <i
                  v-if="ansIndex === question.correct_answer"
                  class="fas fa-check text-success"
                ></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Acordeón de errores -->
      <div
        v-if="
          result.data && result.data.errors && result.data.errors.length > 0
        "
        class="accordion-section accordion-errors"
      >
        <div
          class="accordion-header"
          :class="{ 'is-open': showErrors }"
          @click="showErrors = !showErrors"
        >
          <span>
            <i class="fas fa-exclamation-triangle text-danger"></i>
            Preguntas con error ({{ result.data.errors.length }})
          </span>
          <i
            class="fas"
            :class="showErrors ? 'fa-chevron-up' : 'fa-chevron-down'"
          ></i>
        </div>
        <div v-show="showErrors" class="accordion-content">
          <div
            v-for="(error, index) in result.data.errors"
            :key="index"
            class="error-item"
          >
            <div class="error-header">
              <span v-if="error.spotlight_id" class="error-id">
                <i class="fas fa-hashtag"></i> {{ error.spotlight_id }}
              </span>
              <span v-else class="error-id">
                <i class="fas fa-question-circle"></i> ID desconocido
              </span>
            </div>
            <div class="error-message">
              <i class="fas fa-exclamation-circle"></i>
              {{ error.error }}
            </div>
          </div>
        </div>
      </div>
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
      showCreatedQuestions: false,
      showErrors: true,
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
      this.showCreatedQuestions = false;
      this.showErrors = true;
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
    truncateHtml(html, maxLength) {
      if (!html) return '';
      // Remove HTML tags for length calculation
      const textContent = html.replace(/<[^>]+>/g, '');
      if (textContent.length <= maxLength) {
        return html;
      }
      // Truncate and add ellipsis
      const truncated = textContent.substring(0, maxLength);
      return truncated + '...';
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

/* Result section styles */
.result-section {
  max-height: 60vh;
  overflow-y: auto;
}

.result-summary p {
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Accordion styles */
.accordion-section {
  margin-top: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.accordion-header:hover {
  background-color: #e9ecef;
}

.accordion-header.is-open {
  border-bottom: 1px solid #e2e8f0;
}

.accordion-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.accordion-content {
  max-height: 300px;
  overflow-y: auto;
  background-color: #fff;
}

/* Question item styles */
.question-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.question-item:last-child {
  border-bottom: none;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.question-id {
  font-weight: 600;
  color: #20b000;
  font-size: 13px;
}

.question-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.badge-topic {
  background-color: #e3f2fd;
  color: #1976d2;
}

.badge-subtopic {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.badge-difficulty {
  background-color: #e8f5e9;
  color: #388e3c;
}

.badge-difficulty.difficulty-baja {
  background-color: #e8f5e9;
  color: #388e3c;
}

.badge-difficulty.difficulty-media {
  background-color: #fff3e0;
  color: #f57c00;
}

.badge-difficulty.difficulty-alta {
  background-color: #ffebee;
  color: #d32f2f;
}

.question-preview {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 8px;
}

.question-answers {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.answer-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  color: #718096;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.answer-item.correct-answer {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.answer-letter {
  font-weight: 600;
  min-width: 18px;
}

.answer-text {
  flex: 1;
}

/* Error item styles */
.accordion-errors .accordion-header {
  background-color: #fff5f5;
}

.accordion-errors .accordion-header:hover {
  background-color: #fed7d7;
}

.error-item {
  padding: 12px 16px;
  border-bottom: 1px solid #fed7d7;
  background-color: #fffafa;
}

.error-item:last-child {
  border-bottom: none;
}

.error-header {
  margin-bottom: 4px;
}

.error-id {
  font-weight: 600;
  color: #c53030;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.error-message {
  font-size: 13px;
  color: #742a2a;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.error-message i {
  margin-top: 2px;
  color: #e53e3e;
}

/* Text colors */
.text-success {
  color: #38a169 !important;
}

.text-danger {
  color: #e53e3e !important;
}
</style>

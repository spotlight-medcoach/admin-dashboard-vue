<template>
  <div id="manual-detail">
    <section class="manual-detail-container">
      <article class="full">
        <template v-if="loadingState">
          <loading-state message="Estamos obteniendo los datos del manual" />
        </template>
        <template v-else-if="currentManual">
          <!-------------------------------------------------------------------- Manual Detail Form -->
          <b-form @submit.prevent="updateManual" class="manual-form">
            <b-form-group label="Nombre" label-for="name">
              <b-form-input
                id="name"
                v-model="form.name"
                placeholder="Nombre del Manual"
                required
              />
            </b-form-group>

            <div class="row">
              <div class="col-6">
                <b-form-group label="Tema" label-for="topic">
                  <b-form-select
                    id="topic"
                    v-model="form.topic"
                    :options="topicOptions"
                    required
                  />
                </b-form-group>
              </div>
              <div class="col-6">
                <b-form-group label="Subtema" label-for="subtopic">
                  <b-form-select
                    id="subtopic"
                    v-model="form.subtopic"
                    :options="subtopicOptions"
                    :disabled="form.topic === null"
                    required
                  />
                </b-form-group>
              </div>
            </div>

            <b-form-group label="Contenido" label-for="body">
              <editor
                v-model="form.body"
                :init="editorInit"
                :api-key="tinymceApiKey"
              />
            </b-form-group>

            <b-form-group label="Quiz (Opcional)" label-for="quiz">
              <div v-if="currentManual && currentManual.quiz_file" class="mb-3">
                <p class="text-muted mb-2">
                  <strong>Quiz actual:</strong> Configurado
                </p>
                <div class="d-flex gap-2">
                  <b-button
                    variant="outline-primary"
                    size="sm"
                    @click="showPreview(currentManual.quiz_file)"
                  >
                    <b-icon icon="eye"></b-icon> Previsualizar Quiz
                  </b-button>
                  <b-button
                    variant="outline-danger"
                    size="sm"
                    @click="deleteQuiz"
                    :disabled="isSaving || savingState"
                  >
                    <b-icon icon="trash"></b-icon> Eliminar Quiz
                  </b-button>
                </div>
              </div>
              <b-tabs v-model="quizTabIndex" content-class="mt-3">
                <b-tab
                  title="Subir archivo"
                  :disabled="isSaving || savingState"
                >
                  <b-form-file
                    id="quiz-file"
                    v-model="form.quizFile"
                    accept=".html"
                    placeholder="Selecciona un archivo .html"
                    drop-placeholder="Arrastra un archivo .html aquí"
                    :disabled="isSaving || savingState"
                    @change="onQuizFileChange"
                  />
                  <small v-if="form.quizFile" class="text-muted mt-2 d-block">
                    Archivo seleccionado: {{ form.quizFile.name }}
                  </small>
                  <small v-if="!form.quizFile" class="text-muted mt-2 d-block">
                    Solo se permiten archivos .html
                  </small>
                </b-tab>
                <b-tab
                  title="Editor de texto"
                  :disabled="isSaving || savingState"
                >
                  <b-form-textarea
                    id="quiz-content"
                    v-model="form.quizContent"
                    placeholder="Escribe o pega el código HTML del quiz aquí..."
                    rows="10"
                    :disabled="isSaving || savingState"
                  />
                  <small class="text-muted mt-2 d-block">
                    Puedes escribir el código HTML completo del quiz aquí
                  </small>
                </b-tab>
              </b-tabs>
              <div class="mt-2">
                <b-button
                  v-if="previewQuizUrl"
                  variant="outline-primary"
                  size="sm"
                  @click="showPreview(previewQuizUrl)"
                  :disabled="isSaving || savingState"
                >
                  <b-icon icon="eye"></b-icon> Previsualizar Quiz
                </b-button>
              </div>
            </b-form-group>

            <div class="form-actions">
              <b-button
                type="submit"
                variant="primary"
                :disabled="isSaving || savingState"
              >
                <span v-if="!isSaving">Guardar Cambios</span>
                <span v-else> <b-spinner small></b-spinner> Guardando... </span>
              </b-button>
              <b-button variant="light" @click="goBack">Cancelar</b-button>
            </div>
          </b-form>
        </template>
        <template v-else>
          <div class="text-center">
            <p>Manual no encontrado</p>
            <b-button variant="primary" @click="goBack">Volver</b-button>
          </div>
        </template>
      </article>
    </section>
    <quiz-preview-modal ref="quiz-preview-modal" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingState from '@/components/loading-state.vue';
import QuizPreviewModal from '@/components/pages/manuals/quiz-preview.modal.vue';
import TinyMCEEditor from '@tinymce/tinymce-vue';

let Editor = null;
if (process.client) {
  Editor = TinyMCEEditor.default || TinyMCEEditor;
}

export default {
  components: {
    LoadingState,
    Editor,
    QuizPreviewModal,
  },
  data() {
    return {
      isSaving: false,
      quizTabIndex: 0,
      previewQuizUrl: null,
      form: {
        name: '',
        topic: null,
        subtopic: null,
        body: '',
        quizFile: null,
        quizContent: '',
      },
      editorInit: {
        height: 500,
        menubar: true,
        plugins: [
          'advlist',
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'code',
          'help',
          'wordcount',
        ],
        toolbar:
          'undo redo | styleselect | ' +
          'bold italic forecolor backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | image | code',
        style_formats: [
          {
            title: 'Heading 1',
            block: 'h1',
            styles: {
              'font-family': 'Helvetica, Arial, sans-serif',
              'font-weight': 'bold',
              'font-size': '12pt',
              color: '#2f74b5',
              'line-height': '1.5',
              'margin-top': '0.3em',
              'margin-bottom': '0.3em',
            },
          },
          {
            title: 'Heading 2',
            block: 'h2',
            styles: {
              'font-family': 'Helvetica, Arial, sans-serif',
              'font-weight': 'bold',
              'font-size': '10pt',
              color: '#2f74b5',
              'line-height': '1.5',
              'margin-top': '0.3em',
              'margin-bottom': '0.3em',
            },
          },
          {
            title: 'Paragraph',
            block: 'p',
            styles: {
              'font-family': 'Helvetica, Arial, sans-serif',
              'font-size': '10pt',
              color: '#000000',
              'line-height': '1.5',
              'margin-top': '0.3em',
              'margin-bottom': '0.3em',
            },
          },
        ],
        content_style: `
          body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; }
          h1 { font-family: Helvetica, Arial, sans-serif; font-weight: bold; font-size: 12pt; color: #2f74b5; line-height: 1.5; margin-top: 0.3em; margin-bottom: 0.3em; }
          h2 { font-family: Helvetica, Arial, sans-serif; font-weight: bold; font-size: 10pt; color: #2f74b5; line-height: 1.5; margin-top: 0.3em; margin-bottom: 0.3em; }
          p { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; color: #000000; line-height: 1.5; margin-top: 0.3em; margin-bottom: 0.3em; }
        `,
        // TinyMCE 5 usa callbacks: (blobInfo, success, failure, progress)
        images_upload_handler: (blobInfo, success, failure) => {
          const manualId = this.$route.params.id;
          if (!manualId) {
            failure('No se encontró el ID del manual');
            return;
          }

          const formData = new FormData();
          formData.append('file', blobInfo.blob(), blobInfo.filename());

          this.$axios
            .post(`/manuals/${manualId}/upload-image`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
            .then((response) => {
              const imageUrl = response.data.location;
              if (imageUrl) {
                success(imageUrl);
              } else {
                failure('No se recibió la URL de la imagen');
              }
            })
            .catch((error) => {
              console.error('Error uploading image:', error);
              failure(
                'Error al subir imagen: ' +
                  (error.response?.data?.error || error.message)
              );
            });
        },
      },
    };
  },
  computed: {
    ...mapGetters({
      loadingState: 'manuals/loadingState',
      savingState: 'manuals/savingState',
      currentManual: 'manuals/currentManual',
      topics: 'topics/allTopics',
    }),
    tinymceApiKey() {
      return process.env.TINYMCE_API_KEY || '';
    },
    topicOptions() {
      const initial = [
        { text: '-- Tema del manual', value: null, disabled: true },
      ];
      if (
        !this.topics ||
        !Array.isArray(this.topics) ||
        this.topics.length === 0
      ) {
        return initial;
      }
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
  },
  async created() {
    if (process.browser) {
      this.$axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${localStorage.getItem('user_token')}`;
      // Cargar topics desde el store
      await this.$store.dispatch('topics/fetchTopics');
    }
  },
  async mounted() {
    // Configurar header de la página
    this.$store.dispatch('pageHeader/setHeader', {
      title: 'Editar Manual',
      buttonConfig: {
        type: 'button',
        isBack: true,
        icon: 'fas fa-chevron-left',
        action: 'goBack',
        to: '/manuals',
      },
    });

    // Escuchar evento del botón del header
    this.$nuxt.$on('page-header-button-click', this.handleHeaderButtonClick);

    const manualId = this.$route.params.id;
    if (manualId) {
      await this.$store.dispatch('manuals/fetchManualById', manualId);
      this.loadManualData();
    }
  },
  beforeDestroy() {
    // Limpiar header al salir de la página
    this.$store.dispatch('pageHeader/clearHeader');
    // Remover listener
    this.$nuxt.$off('page-header-button-click', this.handleHeaderButtonClick);
  },
  watch: {
    currentManual() {
      this.loadManualData();
    },
  },
  methods: {
    loadManualData() {
      if (this.currentManual && this.topics && this.topics.length > 0) {
        this.form.name = this.currentManual.name || '';
        this.form.body = this.currentManual.body || '';
        this.form.quizFile = null;
        this.form.quizContent = '';
        this.quizTabIndex = 0;
        if (this.previewQuizUrl) {
          URL.revokeObjectURL(this.previewQuizUrl);
        }
        this.previewQuizUrl = null;

        // Buscar el tema - el campo 'topic' contiene el bubble_id del tema
        let topic = null;
        if (this.currentManual.topic) {
          // Buscar por bubble_id (el campo 'topic' es el bubble_id)
          topic = this.topics.find(
            (t) =>
              t.bubble_id === this.currentManual.topic ||
              t._id === this.currentManual.topic
          );
        } else if (this.currentManual.topic_bubble) {
          // Buscar por topic_bubble (alternativo)
          topic = this.topics.find(
            (t) =>
              t.bubble_id === this.currentManual.topic_bubble ||
              t._id === this.currentManual.topic_bubble
          );
        } else if (this.currentManual.topic_id) {
          // Buscar por _id
          topic = this.topics.find(
            (t) => t._id === this.currentManual.topic_id
          );
        } else if (this.currentManual.topic_name) {
          // Buscar por nombre (fallback)
          topic = this.topics.find(
            (t) => t.name === this.currentManual.topic_name
          );
        }

        if (topic) {
          this.form.topic = topic;

          // Buscar el subtema - el campo 'subtopic' contiene el bubble_id del subtema
          if (topic.subtopics && topic.subtopics.length > 0) {
            let subtopic = null;
            if (this.currentManual.subtopic) {
              // Buscar por subtopic (el campo 'subtopic' es el bubble_id)
              subtopic = topic.subtopics.find(
                (s) =>
                  s.subtopic === this.currentManual.subtopic ||
                  s._id === this.currentManual.subtopic
              );
            } else if (this.currentManual.subtopic_bubble) {
              // Buscar por subtopic_bubble (alternativo)
              subtopic = topic.subtopics.find(
                (s) =>
                  s.subtopic === this.currentManual.subtopic_bubble ||
                  s._id === this.currentManual.subtopic_bubble
              );
            } else if (this.currentManual.subtopic_id) {
              // Buscar por _id
              subtopic = topic.subtopics.find(
                (s) => s._id === this.currentManual.subtopic_id
              );
            } else if (this.currentManual.subtopic_name) {
              // Buscar por nombre (fallback)
              subtopic = topic.subtopics.find(
                (s) => s.name === this.currentManual.subtopic_name
              );
            }

            if (subtopic) {
              this.form.subtopic = subtopic;
            }
          }
        }
      }
    },
    async updateManual() {
      if (!this.form.name || !this.form.topic || !this.form.subtopic) {
        this.$bvToast.toast('Por favor completa todos los campos', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
        return;
      }

      this.isSaving = true;
      try {
        const manualId = this.$route.params.id;
        const updateData = {
          name: this.form.name,
          topic_id: this.form.topic._id,
          subtopic_id: this.form.subtopic._id,
          body: this.form.body,
        };

        // Subir quiz si existe
        if (this.form.quizFile || this.form.quizContent) {
          try {
            if (this.form.quizFile) {
              await this.$store.dispatch('manuals/uploadQuizFile', {
                manualId,
                file: this.form.quizFile,
              });
            } else if (this.form.quizContent) {
              await this.$store.dispatch('manuals/uploadQuizContent', {
                manualId,
                content: this.form.quizContent,
              });
            }
            // Limpiar formulario de quiz después de subir
            this.form.quizFile = null;
            this.form.quizContent = '';
            if (this.previewQuizUrl) {
              URL.revokeObjectURL(this.previewQuizUrl);
              this.previewQuizUrl = null;
            }
          } catch (error) {
            console.error('Error uploading quiz:', error);
            // No fallar la actualización del manual si el quiz falla
          }
        }

        const updated = await this.$store.dispatch('manuals/updateManual', {
          manualId,
          manualData: updateData,
        });

        if (updated && !updated.response) {
          // Usar nextTick para asegurar que el toast se muestre después de los cambios
          this.$nextTick(() => {
            this.$bvToast.toast('Manual actualizado exitosamente', {
              title: '', // Sin título para diseño más limpio
              variant: 'success',
              solid: true,
              toaster: 'b-toaster-top-right',
              autoHideDelay: 10000, // 10 segundos en milisegundos
              noAutoHide: false,
              appendToast: true,
            });
          });
        } else {
          this.$bvToast.toast(
            updated.response?.data?.message || 'Error al actualizar el manual',
            {
              title: 'Error',
              variant: 'danger',
              solid: true,
            }
          );
        }
      } catch (error) {
        console.error('Error updating manual:', error);
        this.$bvToast.toast('Error al actualizar el manual', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isSaving = false;
      }
    },
    goBack() {
      this.$router.push({ path: '/manuals' });
    },
    handleHeaderButtonClick(action) {
      if (action === 'goBack') {
        this.goBack();
      }
    },
    onQuizFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        // Validar que sea .html
        if (!file.name.endsWith('.html') && file.type !== 'text/html') {
          this.$bvToast.toast('Solo se permiten archivos .html', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
          this.form.quizFile = null;
          if (this.previewQuizUrl) {
            URL.revokeObjectURL(this.previewQuizUrl);
          }
          this.previewQuizUrl = null;
          return;
        }
        this.form.quizFile = file;
        // Crear URL temporal para preview
        if (this.previewQuizUrl) {
          URL.revokeObjectURL(this.previewQuizUrl);
        }
        this.previewQuizUrl = URL.createObjectURL(file);
      } else {
        this.form.quizFile = null;
        if (this.previewQuizUrl) {
          URL.revokeObjectURL(this.previewQuizUrl);
        }
        this.previewQuizUrl = null;
      }
    },
    showPreview(url) {
      if (url) {
        this.$refs['quiz-preview-modal'].show(url);
      }
    },
    async deleteQuiz() {
      if (
        !confirm(
          '¿Estás seguro de que deseas eliminar el quiz? Esta acción no se puede deshacer.'
        )
      ) {
        return;
      }

      this.isSaving = true;
      try {
        const manualId = this.$route.params.id;
        const updated = await this.$store.dispatch('manuals/updateManual', {
          manualId,
          manualData: { quiz_file: null },
        });

        if (updated && !updated.response) {
          this.$bvToast.toast('Quiz eliminado exitosamente', {
            title: 'Éxito',
            variant: 'success',
            solid: true,
          });
          // Recargar el manual para actualizar la vista
          await this.$store.dispatch('manuals/fetchManualById', manualId);
          this.loadManualData();
        } else {
          this.$bvToast.toast('Error al eliminar el quiz', {
            title: 'Error',
            variant: 'danger',
            solid: true,
          });
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
        this.$bvToast.toast('Error al eliminar el quiz', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#manual-detail {
  .manual-detail-container {
    font-family: Montserrat;
  }

  .manual-form {
    max-width: 100%;

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 30px;
      justify-content: flex-end;
    }
  }

  .text-center {
    text-align: center;
    padding: 40px;
  }
  .nav-tabs {
    border-bottom: 1px solid #dee2e6;
  }
  .gap-2 {
    gap: 0.5rem;
  }
}
</style>

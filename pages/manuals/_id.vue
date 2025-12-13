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
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingState from '@/components/loading-state.vue';

let Editor = null;
if (process.client) {
  const TinyMCEEditor = require('@tinymce/tinymce-vue');
  Editor = TinyMCEEditor.default || TinyMCEEditor;
}

export default {
  components: {
    LoadingState,
    Editor,
  },
  data() {
    return {
      isSaving: false,
      form: {
        name: '',
        topic: null,
        subtopic: null,
        body: '',
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
          'undo redo | formatselect | ' +
          'bold italic backcolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help | image | code',
        content_style:
          'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        images_upload_handler: async (blobInfo, progress) => {
          // Handler para subir imágenes
          return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());

            this.$axios
              .post('/manual/upload-image', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                  progress((progressEvent.loaded / progressEvent.total) * 100);
                },
              })
              .then((response) => {
                resolve(response.data.url);
              })
              .catch((error) => {
                reject('Error al subir imagen: ' + error.message);
              });
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
}
</style>

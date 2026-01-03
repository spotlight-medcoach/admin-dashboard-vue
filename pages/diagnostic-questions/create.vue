<template>
  <div id="diagnostic-question-create">
    <section class="question-form-container">
      <article class="full">
        <b-form @submit.prevent="createQuestion" class="question-form">
          <b-form-group label="Spotlight ID" label-for="spotlight_id">
            <b-form-input
              id="spotlight_id"
              v-model="form.spotlight_id"
              placeholder="Ej: 1.0001"
              required
            />
          </b-form-group>

          <div class="row">
            <div class="col-6">
              <b-form-group label="Examen" label-for="test_number">
                <b-form-select
                  id="test_number"
                  v-model="form.test_number"
                  :options="testNumberOptions"
                  required
                />
              </b-form-group>
            </div>
            <div class="col-6">
              <b-form-group label="Dificultad" label-for="difficulty">
                <b-form-select
                  id="difficulty"
                  v-model="form.difficulty"
                  :options="difficultyOptions"
                  required
                />
              </b-form-group>
            </div>
          </div>

          <div class="row">
            <div class="col-6">
              <b-form-group label="Bloque" label-for="topic">
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
                  :disabled="!form.topic"
                  required
                />
              </b-form-group>
            </div>
          </div>

          <div class="row">
            <div class="col-6">
              <b-form-group label="Categoría" label-for="category">
                <b-form-select
                  id="category"
                  v-model="form.category"
                  :options="categoryOptions"
                />
              </b-form-group>
            </div>
            <div class="col-6">
              <b-form-group label="Tipo de pregunta" label-for="type">
                <b-form-input
                  id="type"
                  v-model="form.type"
                  placeholder="Ej: Diagnóstico"
                />
              </b-form-group>
            </div>
          </div>

          <b-form-group label="Nombre" label-for="manual">
            <b-form-input
              id="manual"
              v-model="form.manual"
              placeholder="Nombre del manual"
              required
            />
          </b-form-group>

          <b-form-group label="Idioma" label-for="language">
            <b-form-select
              id="language"
              v-model="form.language"
              :options="languageOptions"
              required
            />
          </b-form-group>

          <b-form-group label="Pregunta" label-for="question">
            <editor
              v-model="form.question_html"
              :init="editorInit"
              :api-key="tinymceApiKey"
            />
          </b-form-group>

          <b-form-group label="Respuestas">
            <div
              v-for="(answer, index) in form.answers"
              :key="index"
              class="answer-item"
            >
              <div class="row">
                <div class="col-10">
                  <editor
                    v-model="answer.html"
                    :init="editorInit"
                    :api-key="tinymceApiKey"
                  />
                </div>
                <div class="col-2">
                  <b-form-checkbox
                    v-model="answer.is_correct"
                    @change="updateCorrectAnswer"
                  >
                    Correcta
                  </b-form-checkbox>
                  <button
                    v-if="form.answers.length > 2"
                    type="button"
                    class="btn btn-sm btn-danger mt-2"
                    @click="removeAnswer(index)"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-primary mt-2"
              @click="addAnswer"
            >
              Agregar Respuesta
            </button>
          </b-form-group>

          <b-form-group label="Retroalimentación" label-for="retro">
            <editor
              v-model="form.retro_html"
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
              <span v-if="!isSaving">Crear Pregunta</span>
              <span v-else> <b-spinner small></b-spinner> Guardando... </span>
            </b-button>
            <b-button variant="light" @click="goBack">Cancelar</b-button>
          </div>
        </b-form>
      </article>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

let Editor = null;
if (process.client) {
  const TinyMCEEditor = require('@tinymce/tinymce-vue');
  Editor = TinyMCEEditor.default || TinyMCEEditor;
}

export default {
  components: {
    Editor,
  },
  data() {
    return {
      isSaving: false,
      form: {
        spotlight_id: '',
        test_number: 1,
        topic: null,
        subtopic: null,
        category: '',
        type: '',
        manual: '',
        difficulty: 'Baja',
        language: 'Español',
        question_html: '',
        answers: [
          { id: 0, html: '', is_correct: false },
          { id: 1, html: '', is_correct: false },
        ],
        retro_html: '',
      },
      editorInit: {
        height: 300,
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
      },
      testNumberOptions: [
        { text: 'Diagnóstico 1', value: 1 },
        { text: 'Diagnóstico 2', value: 2 },
      ],
      difficultyOptions: [
        { text: 'Baja', value: 'Baja' },
        { text: 'Media', value: 'Media' },
        { text: 'Alta', value: 'Alta' },
      ],
      languageOptions: [
        { text: 'Español', value: 'Español' },
        { text: 'Inglés', value: 'Inglés' },
      ],
    };
  },
  computed: {
    ...mapGetters({
      savingState: 'diagnosticQuestions/savingState',
      topics: 'topics/allTopics',
      categories: 'categories/allCategories',
    }),
    categoryOptions() {
      const initial = [
        { text: '-- Selecciona una categoría', value: '', disabled: true },
      ];
      if (
        !this.categories ||
        !Array.isArray(this.categories) ||
        this.categories.length === 0
      ) {
        return initial;
      }
      return initial.concat(
        this.categories.map((category) => ({
          text: category.name,
          value: category.name,
        }))
      );
    },
    tinymceApiKey() {
      return process.env.TINYMCE_API_KEY || '';
    },
    topicOptions() {
      const initial = [
        { text: '-- Selecciona un tema', value: null, disabled: true },
      ];
      if (
        !this.topics ||
        !Array.isArray(this.topics) ||
        this.topics.length === 0
      ) {
        return initial;
      }
      return initial.concat(
        this.topics.map((topic) => ({
          text: topic.name,
          value: topic._id,
        }))
      );
    },
    subtopicOptions() {
      const initial = [
        { text: '-- Selecciona un subtema', value: null, disabled: true },
      ];
      if (!this.form.topic) {
        return initial;
      }
      const selectedTopic = this.topics.find(
        (topic) => topic._id === this.form.topic
      );
      if (!selectedTopic || !selectedTopic.subtopics) {
        return initial;
      }
      return initial.concat(
        selectedTopic.subtopics.map((subtopic) => ({
          text: subtopic.name,
          value: subtopic._id,
        }))
      );
    },
  },
  async created() {
    if (process.browser) {
      await this.$store.dispatch('topics/fetchTopics');
      await this.$store.dispatch('categories/fetchCategories');
    }
  },
  mounted() {
    this.$store.dispatch('pageHeader/setHeader', {
      title: 'Crear Pregunta de Diagnóstico',
      buttonConfig: {
        type: 'button',
        isBack: true,
        icon: 'fas fa-chevron-left',
        action: 'goBack',
        to: '/diagnostic-questions',
      },
    });
    this.$nuxt.$on('page-header-button-click', this.handleHeaderButtonClick);
  },
  beforeDestroy() {
    this.$store.dispatch('pageHeader/clearHeader');
    this.$nuxt.$off('page-header-button-click', this.handleHeaderButtonClick);
  },
  methods: {
    handleHeaderButtonClick(action) {
      if (action === 'goBack') {
        this.goBack();
      }
    },
    goBack() {
      this.$router.push('/diagnostic-questions');
    },
    addAnswer() {
      const newId = this.form.answers.length;
      this.form.answers.push({ id: newId, html: '', is_correct: false });
    },
    removeAnswer(index) {
      if (this.form.answers.length > 2) {
        this.form.answers.splice(index, 1);
        // Re-index answers
        this.form.answers.forEach((answer, idx) => {
          answer.id = idx;
        });
        this.updateCorrectAnswer();
      }
    },
    updateCorrectAnswer() {
      // Ensure only one answer is marked as correct
      const correctCount = this.form.answers.filter((a) => a.is_correct).length;
      if (correctCount > 1) {
        // If multiple are correct, keep only the last one
        let foundFirst = false;
        this.form.answers.forEach((answer) => {
          if (answer.is_correct && foundFirst) {
            answer.is_correct = false;
          } else if (answer.is_correct) {
            foundFirst = true;
          }
        });
      }
    },
    async createQuestion() {
      try {
        this.isSaving = true;

        // Find correct answer index
        const correctAnswerIndex = this.form.answers.findIndex(
          (a) => a.is_correct
        );

        if (correctAnswerIndex === -1) {
          alert('Debes marcar una respuesta como correcta');
          return;
        }

        const questionData = {
          spotlight_id: this.form.spotlight_id,
          test_number: this.form.test_number,
          topic: this.form.topic,
          subtopic: this.form.subtopic,
          category: this.form.category || undefined,
          type: this.form.type || undefined,
          manual: this.form.manual,
          difficulty: this.form.difficulty,
          language: this.form.language,
          question: {
            content: {},
            html: this.form.question_html,
          },
          answers: this.form.answers.map((answer, index) => ({
            id: index,
            content: {},
            html: answer.html,
          })),
          correct_answer: correctAnswerIndex,
          retro: {
            content: {},
            html: this.form.retro_html,
          },
        };

        await this.$store.dispatch(
          'diagnosticQuestions/createQuestion',
          questionData
        );
        this.$router.push('/diagnostic-questions');
      } catch (error) {
        console.error('Error creating question:', error);
        alert('Error al crear la pregunta');
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#diagnostic-question-create {
  .answer-item {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
}
</style>

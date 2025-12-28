<template>
  <div id="custom-question-edit">
    <section class="question-form-container">
      <article class="full">
        <loading-state
          v-if="loadingState"
          message="Estamos obteniendo los datos del caso"
        />
        <b-form
          v-else-if="currentCase"
          @submit.prevent="updateCase"
          class="question-form"
        >
          <b-form-group label="Spotlight ID" label-for="spotlight_id">
            <b-form-input
              id="spotlight_id"
              v-model="form.spotlight_id"
              placeholder="Ej: 1.0001"
              required
            />
          </b-form-group>

          <b-form-group label="Nombre del Caso" label-for="name">
            <b-form-input
              id="name"
              v-model="form.name"
              placeholder="Nombre descriptivo del caso"
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
                  :disabled="!form.topic"
                  required
                />
              </b-form-group>
            </div>
          </div>

          <b-form-group label="Manual" label-for="manual">
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

          <b-form-group label="Descripción del Caso" label-for="case_content">
            <editor
              v-model="form.case_content"
              :init="editorInit"
              :api-key="tinymceApiKey"
            />
          </b-form-group>

          <b-form-group label="Preguntas">
            <div
              v-for="(question, questionIndex) in form.questions"
              :key="questionIndex"
              class="question-card"
            >
              <div class="question-header">
                <h5>Pregunta {{ questionIndex + 1 }}</h5>
                <button
                  v-if="form.questions.length > 1"
                  type="button"
                  class="btn btn-sm btn-danger"
                  @click="removeQuestion(questionIndex)"
                >
                  <i class="fas fa-trash"></i> Eliminar Pregunta
                </button>
              </div>

              <b-form-group label="Tipo" label-for="question-type">
                <b-form-input
                  :id="`question-type-${questionIndex}`"
                  v-model="question.type"
                  placeholder="Ej: Diagnóstico"
                  required
                />
              </b-form-group>

              <b-form-group label="Dificultad" label-for="question-difficulty">
                <b-form-select
                  :id="`question-difficulty-${questionIndex}`"
                  v-model="question.difficulty"
                  :options="difficultyOptions"
                  required
                />
              </b-form-group>

              <b-form-group label="Pregunta" label-for="question-text">
                <editor
                  :id="`question-editor-${questionIndex}`"
                  v-model="question.question_html"
                  :init="editorInit"
                  :api-key="tinymceApiKey"
                />
              </b-form-group>

              <b-form-group label="Respuestas">
                <div
                  v-for="(answer, answerIndex) in question.answers"
                  :key="answerIndex"
                  class="answer-item"
                >
                  <div class="row">
                    <div class="col-10">
                      <editor
                        :id="`answer-editor-${questionIndex}-${answerIndex}`"
                        v-model="answer.html"
                        :init="editorInit"
                        :api-key="tinymceApiKey"
                      />
                    </div>
                    <div class="col-2">
                      <b-form-checkbox
                        :id="`answer-correct-${questionIndex}-${answerIndex}`"
                        v-model="answer.is_correct"
                        @change="updateCorrectAnswer(questionIndex)"
                      >
                        Correcta
                      </b-form-checkbox>
                      <button
                        v-if="question.answers.length > 2"
                        type="button"
                        class="btn btn-sm btn-danger mt-2"
                        @click="removeAnswer(questionIndex, answerIndex)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn btn-primary mt-2"
                  @click="addAnswer(questionIndex)"
                >
                  Agregar Respuesta
                </button>
              </b-form-group>

              <b-form-group label="Retroalimentación" label-for="retro">
                <editor
                  :id="`retro-editor-${questionIndex}`"
                  v-model="question.retro_html"
                  :init="editorInit"
                  :api-key="tinymceApiKey"
                />
              </b-form-group>
            </div>
            <button
              type="button"
              class="btn btn-primary mt-2"
              @click="addQuestion"
            >
              <i class="fas fa-plus"></i> Agregar Pregunta
            </button>
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
        spotlight_id: '',
        name: '',
        topic: null,
        subtopic: null,
        manual: '',
        language: 'Español',
        case_content: '',
        questions: [],
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
      loadingState: 'customQuestions/loadingState',
      savingState: 'customQuestions/savingState',
      currentQuestion: 'customQuestions/currentQuestion',
      currentCase: 'customQuestions/currentCase',
      topics: 'topics/allTopics',
    }),
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
    }
  },
  async mounted() {
    this.$store.dispatch('pageHeader/setHeader', {
      title: 'Editar Caso Personalizado',
      buttonConfig: {
        type: 'button',
        isBack: true,
        icon: 'fas fa-chevron-left',
        action: 'goBack',
        to: '/custom-questions',
      },
    });
    this.$nuxt.$on('page-header-button-click', this.handleHeaderButtonClick);

    const caseId = this.$route.params.id;
    if (caseId) {
      await this.$store.dispatch('customQuestions/fetchQuestionById', caseId);
      this.loadCaseData();
    }
  },
  beforeDestroy() {
    this.$store.dispatch('pageHeader/clearHeader');
    this.$nuxt.$off('page-header-button-click', this.handleHeaderButtonClick);
  },
  watch: {
    currentCase() {
      this.loadCaseData();
    },
    currentQuestion() {
      this.loadCaseData();
    },
  },
  methods: {
    handleHeaderButtonClick(action) {
      if (action === 'goBack') {
        this.goBack();
      }
    },
    goBack() {
      this.$router.push('/custom-questions');
    },
    loadCaseData() {
      const caseDoc = this.currentCase || this.currentQuestion;
      if (caseDoc && this.topics && this.topics.length > 0) {
        this.form.spotlight_id = caseDoc.spotlight_id || '';
        this.form.name = caseDoc.name || '';
        this.form.topic = caseDoc.topic || null;
        this.form.subtopic = caseDoc.subtopic || null;
        this.form.manual = caseDoc.manual || '';
        this.form.language = caseDoc.language || 'Español';
        this.form.case_content = caseDoc.content?.html || '';

        // Load questions
        const questions = caseDoc.questions || [];
        this.form.questions = questions.map((q, index) => {
          // Convertir importance a difficulty
          let difficulty = 'Baja';
          if (q.importance === 2) difficulty = 'Media';
          if (q.importance === 3) difficulty = 'Alta';

          return {
            type: q.type || 'Diagnóstico',
            difficulty,
            question_html: q.question?.html || '',
            answers: (q.answers || []).map((answer, ansIndex) => ({
              id: ansIndex,
              html: answer.html || '',
              is_correct: ansIndex === q.correct_answer,
            })),
            retro_html: q.retro?.html || '',
          };
        });
      }
    },
    addQuestion() {
      this.form.questions.push({
        type: 'Diagnóstico',
        difficulty: 'Baja',
        question_html: '',
        answers: [
          { id: 0, html: '', is_correct: false },
          { id: 1, html: '', is_correct: false },
        ],
        retro_html: '',
      });
    },
    removeQuestion(index) {
      if (this.form.questions.length > 1) {
        this.form.questions.splice(index, 1);
      }
    },
    addAnswer(questionIndex) {
      const question = this.form.questions[questionIndex];
      const newId = question.answers.length;
      question.answers.push({ id: newId, html: '', is_correct: false });
    },
    removeAnswer(questionIndex, answerIndex) {
      const question = this.form.questions[questionIndex];
      if (question.answers.length > 2) {
        question.answers.splice(answerIndex, 1);
        question.answers.forEach((answer, idx) => {
          answer.id = idx;
        });
        this.updateCorrectAnswer(questionIndex);
      }
    },
    updateCorrectAnswer(questionIndex) {
      const question = this.form.questions[questionIndex];
      const correctCount = question.answers.filter((a) => a.is_correct).length;
      if (correctCount > 1) {
        let foundFirst = false;
        question.answers.forEach((answer) => {
          if (answer.is_correct && foundFirst) {
            answer.is_correct = false;
          } else if (answer.is_correct) {
            foundFirst = true;
          }
        });
      }
    },
    async updateCase() {
      try {
        this.isSaving = true;

        // Validar que todas las preguntas tengan al menos una respuesta correcta
        for (let i = 0; i < this.form.questions.length; i++) {
          const q = this.form.questions[i];
          const correctAnswerIndex = q.answers.findIndex((a) => a.is_correct);

          if (correctAnswerIndex === -1) {
            alert(
              `Debes marcar una respuesta como correcta en la pregunta ${i + 1}`
            );
            return;
          }
        }

        const caseData = {
          spotlight_id: this.form.spotlight_id,
          name: this.form.name,
          content: {
            quill: {},
            html: this.form.case_content,
          },
          topic: this.form.topic,
          subtopic: this.form.subtopic,
          manual: this.form.manual,
          language: this.form.language,
          questions: this.form.questions.map((q) => {
            const correctAnswerIndex = q.answers.findIndex((a) => a.is_correct);
            return {
              type: q.type,
              question: {
                content: {},
                html: q.question_html,
              },
              answers: q.answers.map((answer, index) => ({
                id: index,
                content: {},
                html: answer.html,
              })),
              correct_answer: correctAnswerIndex,
              retro: {
                content: {},
                html: q.retro_html,
              },
              difficulty: q.difficulty,
            };
          }),
        };

        await this.$store.dispatch('customQuestions/updateQuestion', {
          questionId: this.$route.params.id,
          questionData: caseData,
        });
        this.$router.push('/custom-questions');
      } catch (error) {
        console.error('Error updating case:', error);
        alert('Error al actualizar el caso');
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
#custom-question-edit {
  .question-card {
    margin-bottom: 30px;
    padding: 20px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ddd;

      h5 {
        margin: 0;
        color: #333;
      }
    }
  }

  .answer-item {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background: white;
  }
}
</style>

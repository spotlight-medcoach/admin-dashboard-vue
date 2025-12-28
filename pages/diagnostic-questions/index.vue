<template>
  <div id="diagnostic-questions">
    <section class="diagnostic-questions-container">
      <article class="full">
        <template>
          <data-table-container
            :data="questions"
            :columns="tableColumns"
            :loading="loadingState"
            :show-full-loader="isInitialLoad"
            loading-message="Estamos obteniendo tus resultados"
            :search="search"
            search-placeholder="Buscar por ID o manual"
            :filters="tableFilters"
            :filter-values="filterValues"
            :current-page="page"
            :page-results="pageResults"
            :total="totalQuestions"
            total-label="preguntas"
            :page-size-options="[5, 10, 15, 20, 25]"
            empty-message="No hay preguntas de diagnóstico disponibles"
            @update:search="handleSearchUpdate"
            @search="searchQuestions"
            @filter-change="handleFilterChange"
            @page-change="handlePageChange"
            @page-results-change="handlePageResultsChange"
          >
            <template #cell-actions="{ row }">
              <div class="td-actions">
                <button class="btn edit" @click="editQuestion(row._id)">
                  <i class="fas fa-pencil-alt"></i> Editar
                </button>
                <button
                  class="btn delete"
                  @click="deleteQuestionConfirm(row._id)"
                >
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </div>
            </template>
          </data-table-container>
        </template>
      </article>
    </section>
    <!--------------------------------------------------------------------------- Upload DOCX Modal -->
    <upload-questions-docx-modal
      :question-type="'diagnostic'"
      @onUpload="handleDocxUploaded"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import DataTableContainer from '@/components/tables/data-table-container.vue';
import UploadQuestionsDocxModal from '@/components/modals/administrators/upload-questions-docx.modal.vue';

export default {
  components: {
    DataTableContainer,
    UploadQuestionsDocxModal,
  },
  data() {
    return {
      page: 1,
      pageResults: 10,
      search: '',
      testNumberSelected: '',
      topicSelected: '',
      subtopicSelected: '',
      isInitialLoad: true,
    };
  },
  computed: {
    ...mapGetters({
      loadingState: 'diagnosticQuestions/loadingState',
      questions: 'diagnosticQuestions/allQuestions',
      totalQuestions: 'diagnosticQuestions/totalQuestions',
      topics: 'topics/allTopics',
    }),
    filterValues() {
      return {
        test_number: this.testNumberSelected,
        topic: this.topicSelected,
        subtopic: this.subtopicSelected,
      };
    },
    tableFilters() {
      return [
        {
          key: 'test_number',
          label: 'Examen',
          placeholder: 'Todos los exámenes',
          defaultValue: '',
          options: [
            { id: 1, name: 'Diagnóstico 1' },
            { id: 2, name: 'Diagnóstico 2' },
          ],
        },
        {
          key: 'topic',
          label: 'Tema',
          placeholder: 'Todos los temas',
          defaultValue: '',
          options: this.uniqueTopics,
        },
        {
          key: 'subtopic',
          label: 'Subtema',
          placeholder: 'Todos los subtemas',
          dependsOnPlaceholder: 'Selecciona un tema primero',
          defaultValue: '',
          dependsOn: 'topic',
          options: this.filteredSubtopics,
        },
      ];
    },
    tableColumns() {
      return [
        {
          key: 'spotlight_id',
          label: 'ID',
          scope: 'col',
          width: 15,
        },
        {
          key: 'test_number',
          label: 'Examen',
          scope: 'col',
          width: 15,
          value: (row) =>
            row.test_number === 1 ? 'Diagnóstico 1' : 'Diagnóstico 2',
        },
        {
          key: 'topic',
          label: 'Tema',
          scope: 'col',
          width: 20,
        },
        {
          key: 'subtopic',
          label: 'Subtema',
          scope: 'col',
          width: 20,
        },
        {
          key: 'difficulty',
          label: 'Dificultad',
          scope: 'col',
          width: 15,
        },
        {
          key: 'actions',
          label: 'Acciones',
          scope: 'col',
          width: 15,
        },
      ];
    },
    uniqueTopics() {
      if (
        !this.topics ||
        !Array.isArray(this.topics) ||
        this.topics.length === 0
      ) {
        return [];
      }

      return this.topics
        .map((topic) => ({
          id: topic.bubble_id,
          name: topic.name || topic.bubble_id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    filteredSubtopics() {
      if (!this.topicSelected) {
        return [];
      }

      const selectedTopic = this.topics.find(
        (topic) => topic.bubble_id === this.topicSelected
      );

      if (
        !selectedTopic ||
        !selectedTopic.subtopics ||
        !Array.isArray(selectedTopic.subtopics)
      ) {
        return [];
      }

      return selectedTopic.subtopics
        .map((subtopic) => ({
          id: subtopic.subtopic || subtopic._id,
          name: subtopic.name || subtopic.subtopic || subtopic._id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  methods: {
    createQuestion() {
      this.$router.push({
        path: '/diagnostic-questions/create',
      });
    },
    editQuestion(questionId) {
      this.$router.push({
        path: `/diagnostic-questions/${questionId}`,
      });
    },
    deleteQuestionConfirm(questionId) {
      if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
        this.deleteQuestion(questionId);
      }
    },
    async deleteQuestion(questionId) {
      try {
        await this.$store.dispatch(
          'diagnosticQuestions/deleteQuestion',
          questionId
        );
        await this.getQuestions();
      } catch (err) {
        console.error('Error deleting question:', err);
        alert('Error al eliminar la pregunta');
      }
    },
    async handleDocxUploaded() {
      this.page = 1;
      await this.getQuestions();
    },
    async getQuestions() {
      try {
        const params = {
          page: this.page,
          pageResults: this.pageResults,
        };

        if (this.search && this.search.trim() !== '') {
          params.search = this.search.trim();
        }

        if (this.testNumberSelected) {
          params.test_number = parseInt(this.testNumberSelected);
        }

        if (this.topicSelected && this.topicSelected.trim() !== '') {
          params.topic = this.topicSelected.trim();
        }

        if (this.subtopicSelected && this.subtopicSelected.trim() !== '') {
          params.subtopic = this.subtopicSelected.trim();
        }

        await this.$store.dispatch(
          'diagnosticQuestions/fetchQuestions',
          params
        );
      } catch (err) {
        console.error('Error getting questions:', err);
      }
    },
    handleSearchUpdate(value) {
      this.search = value;
    },
    searchQuestions() {
      this.page = 1;
      this.getQuestions();
    },
    handleFilterChange({ key, value }) {
      if (key === 'test_number') {
        this.testNumberSelected = value;
        this.page = 1;
        this.getQuestions();
      } else if (key === 'topic') {
        this.topicSelected = value;
        this.subtopicSelected = '';
        this.page = 1;
        this.getQuestions();
      } else if (key === 'subtopic') {
        this.subtopicSelected = value;
        this.page = 1;
        this.getQuestions();
      }
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.getQuestions();
    },
    handlePageResultsChange(newPageResults) {
      this.pageResults = newPageResults;
      this.page = 1;
      this.getQuestions();
    },
    handleHeaderButtonClick(action) {
      if (action === 'createQuestion') {
        this.createQuestion();
      } else if (action === 'uploadDocx') {
        this.$bvModal.show('upload-questions-docx-modal');
      }
    },
  },
  async created() {
    if (process.browser) {
      await this.$store.dispatch('topics/fetchTopics');
    }
  },
  async mounted() {
    this.$store.dispatch('pageHeader/setHeader', {
      title: 'Preguntas de Diagnóstico',
      buttonConfig: {
        type: 'dropdown',
        text: 'Agregar pregunta',
        icon: 'fas fa-plus',
        items: [
          {
            text: 'Crear pregunta nueva',
            action: 'createQuestion',
            icon: 'fas fa-plus-circle',
          },
          {
            text: 'Cargar archivo',
            action: 'uploadDocx',
            icon: 'fas fa-file-upload',
          },
        ],
      },
    });

    this.$nuxt.$on('page-header-button-click', this.handleHeaderButtonClick);

    await this.getQuestions();
    this.isInitialLoad = false;
  },
  beforeDestroy() {
    this.$store.dispatch('pageHeader/clearHeader');
    this.$nuxt.$off('page-header-button-click', this.handleHeaderButtonClick);
  },
};
</script>

<style lang="scss" scoped>
#diagnostic-questions {
  .td-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
  }

  .td-actions .btn {
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 5px;
    margin: 0;
    flex-shrink: 0;
    font-size: 12px;
    transition: all 0.2s ease;

    i {
      margin-right: 5px;
    }

    &.edit {
      color: #1ca4fc;
      background: #e9f6ff;

      &:hover {
        background: #d4e8f5;
      }
    }

    &.delete {
      color: #db1212;
      background: #fee;

      &:hover {
        background: #fdd;
      }
    }
  }
}
</style>

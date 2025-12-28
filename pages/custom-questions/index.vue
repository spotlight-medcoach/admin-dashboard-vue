<template>
  <div id="custom-questions">
    <section class="custom-questions-container">
      <article class="full">
        <div class="bulk-actions-bar">
          <div class="select-all-container">
            <input
              type="checkbox"
              :checked="allSelected"
              :indeterminate="someSelected && !allSelected"
              @change="toggleSelectAll"
            />
            <span class="select-all-label">Seleccionar todo</span>
          </div>
          <div v-if="selectedCases.length > 0" class="selected-actions">
            <span class="selected-count">
              {{ selectedCases.length }} caso(s) seleccionado(s)
            </span>
            <button
              class="btn btn-danger btn-sm"
              @click="showDeleteModal = true"
            >
              <i class="fas fa-trash"></i> Eliminar seleccionados
            </button>
          </div>
        </div>
        <template>
          <data-table-container
            :data="questions"
            :columns="tableColumns"
            :loading="loadingState"
            :show-full-loader="isInitialLoad"
            loading-message="Estamos obteniendo tus resultados"
            :search="search"
            search-placeholder="Buscar por ID, nombre o manual"
            :filters="tableFilters"
            :filter-values="filterValues"
            :current-page="page"
            :page-results="pageResults"
            :total="totalQuestions"
            total-label="casos"
            :page-size-options="[5, 10, 15, 20, 25]"
            empty-message="No hay casos personalizados disponibles"
            :advanced="true"
            :sortable="['created_at', 'name', 'spotlight_id']"
            :default-sort="{ key: 'created_at', order: 'desc' }"
            :fixed-columns="['checkbox', 'actions']"
            @update:search="handleSearchUpdate"
            @search="searchQuestions"
            @filter-change="handleFilterChange"
            @page-change="handlePageChange"
            @page-results-change="handlePageResultsChange"
            @sort-change="handleSortChange"
          >
            <template #cell-checkbox="{ row }">
              <input
                type="checkbox"
                :checked="selectedCases.includes(row._id)"
                @change="toggleCaseSelection(row._id)"
              />
            </template>
            <template #cell-name="{ row }">
              {{ row.name || row.spotlight_id }}
            </template>
            <template #cell-questions_count="{ row }">
              {{
                row.questions_count ||
                (row.questions ? row.questions.length : 0)
              }}
              pregunta(s)
            </template>
            <template #cell-created_at="{ row }">
              {{
                row.created_at
                  ? new Date(row.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Sin fecha'
              }}
            </template>
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
    <upload-questions-docx-modal
      :question-type="'custom'"
      @onUpload="handleDocxUploaded"
    />
    <!-- Modal de confirmación para eliminación masiva -->
    <b-modal
      id="delete-multiple-modal"
      v-model="showDeleteModal"
      title="Confirmar eliminación"
      @ok="deleteMultipleCases"
      @cancel="showDeleteModal = false"
    >
      <p>
        ¿Estás seguro de que deseas eliminar
        <strong>{{ selectedCases.length }}</strong> caso(s) seleccionado(s)?
      </p>
      <p class="text-danger">Esta acción no se puede deshacer.</p>
    </b-modal>
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
      topicSelected: '',
      subtopicSelected: '',
      isInitialLoad: true,
      selectedCases: [],
      showDeleteModal: false,
      sortBy: 'created_at',
      sortOrder: 'desc',
    };
  },
  computed: {
    ...mapGetters({
      loadingState: 'customQuestions/loadingState',
      questions: 'customQuestions/allQuestions',
      totalQuestions: 'customQuestions/totalQuestions',
      topics: 'topics/allTopics',
    }),
    filterValues() {
      return {
        topic: this.topicSelected,
        subtopic: this.subtopicSelected,
      };
    },
    tableFilters() {
      return [
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
      const columns = [
        {
          key: 'checkbox',
          label: '',
          scope: 'col',
          width: 5,
        },
        {
          key: 'spotlight_id',
          label: 'ID',
          scope: 'col',
          width: 12,
        },
        {
          key: 'name',
          label: 'Nombre',
          scope: 'col',
          width: 20,
        },
        {
          key: 'topic',
          label: 'Tema',
          scope: 'col',
          width: 20,
          value: (row) => row.topic_name || row.topic,
        },
        {
          key: 'subtopic',
          label: 'Subtema',
          scope: 'col',
          width: 20,
          value: (row) => row.subtopic_name || row.subtopic,
        },
        {
          key: 'questions_count',
          label: 'Preguntas',
          scope: 'col',
          width: 10,
        },
        {
          key: 'created_at',
          label: 'Fecha de creación',
          scope: 'col',
          width: 15,
          value: (row) =>
            row.created_at
              ? new Date(row.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Sin fecha',
        },
        {
          key: 'actions',
          label: 'Acciones',
          scope: 'col',
          width: 15,
        },
      ];
      return columns;
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
    allSelected() {
      if (!this.questions || this.questions.length === 0) return false;
      return this.questions.every((q) => this.selectedCases.includes(q._id));
    },
    someSelected() {
      if (!this.questions || this.questions.length === 0) return false;
      return this.selectedCases.length > 0;
    },
  },
  watch: {
    questions() {
      // Limpiar selección cuando cambian los datos
      this.selectedCases = [];
    },
  },
  methods: {
    toggleCaseSelection(caseId) {
      const index = this.selectedCases.indexOf(caseId);
      if (index > -1) {
        this.selectedCases.splice(index, 1);
      } else {
        this.selectedCases.push(caseId);
      }
    },
    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedCases = [];
      } else {
        this.selectedCases = this.questions.map((q) => q._id);
      }
    },
    async deleteMultipleCases() {
      try {
        await this.$store.dispatch(
          'customQuestions/deleteMultipleCases',
          this.selectedCases
        );
        this.selectedCases = [];
        this.showDeleteModal = false;
        await this.getQuestions();
        this.$bvToast.toast('Casos eliminados correctamente', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });
      } catch (err) {
        console.error('Error deleting cases:', err);
        this.$bvToast.toast('Error al eliminar los casos', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
      }
    },
    createQuestion() {
      this.$router.push({
        path: '/custom-questions/create',
      });
    },
    editQuestion(caseId) {
      this.$router.push({
        path: `/custom-questions/${caseId}`,
      });
    },
    deleteQuestionConfirm(caseId) {
      if (confirm('¿Estás seguro de que deseas eliminar este caso?')) {
        this.deleteQuestion(caseId);
      }
    },
    async deleteQuestion(caseId) {
      try {
        await this.$store.dispatch('customQuestions/deleteQuestion', caseId);
        await this.getQuestions();
      } catch (err) {
        console.error('Error deleting case:', err);
        alert('Error al eliminar el caso');
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

        if (this.topicSelected && this.topicSelected.trim() !== '') {
          params.topic = this.topicSelected.trim();
        }

        if (this.subtopicSelected && this.subtopicSelected.trim() !== '') {
          params.subtopic = this.subtopicSelected.trim();
        }

        // Agregar parámetros de ordenamiento
        if (this.sortBy) {
          params.sortBy = this.sortBy;
        }
        if (this.sortOrder) {
          params.sortOrder = this.sortOrder;
        }

        await this.$store.dispatch('customQuestions/fetchQuestions', params);
      } catch (err) {
        console.error('Error getting cases:', err);
      }
    },
    handleSortChange(sortInfo) {
      this.sortBy = sortInfo.key;
      this.sortOrder = sortInfo.order;
      this.page = 1; // Resetear a primera página al cambiar ordenamiento
      this.getQuestions();
    },
    handleSearchUpdate(value) {
      this.search = value;
    },
    searchQuestions() {
      this.page = 1;
      this.getQuestions();
    },
    handleFilterChange({ key, value }) {
      if (key === 'topic') {
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
      title: 'Casos Personalizados',
      buttonConfig: {
        type: 'dropdown',
        text: 'Agregar caso',
        icon: 'fas fa-plus',
        items: [
          {
            text: 'Crear caso nuevo',
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
#custom-questions {
  .bulk-actions-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 5px;
    margin-bottom: 20px;

    .select-all-container {
      display: flex;
      align-items: center;
      gap: 8px;

      .select-all-label {
        font-weight: 500;
        color: #495057;
        cursor: pointer;
        user-select: none;
      }
    }

    .selected-actions {
      display: flex;
      align-items: center;
      gap: 15px;

      .selected-count {
        font-weight: 600;
        color: #495057;
      }
    }
  }

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

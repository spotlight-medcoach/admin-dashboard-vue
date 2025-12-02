<template>
  <div id="manuals">
    <section class="manuals-container">
      <article class="full">
        <template>
          <data-table-container
            :data="manuals"
            :columns="tableColumns"
            :loading="loadingState"
            :show-full-loader="isInitialLoad"
            loading-message="Estamos obteniendo tus resultados"
            :search="search"
            search-placeholder="Buscar por nombre"
            :filters="tableFilters"
            :filter-values="filterValues"
            :current-page="page"
            :page-results="pageResults"
            :total="totalManuals"
            total-label="manuales"
            :page-size-options="[5, 10, 15, 20, 25]"
            empty-message="No hay manuales disponibles"
            @update:search="handleSearchUpdate"
            @search="searchManuals"
            @filter-change="handleFilterChange"
            @page-change="handlePageChange"
            @page-results-change="handlePageResultsChange"
          >
            <template #cell-conversion_status="{ row }">
              <conversion-status
                :status="getConversionStatusForManual(row._id)"
              />
            </template>
            <template #cell-actions="{ row }">
              <div class="td-actions">
                <button class="btn edit" @click="editManual(row._id)">
                  <i class="fas fa-pencil-alt"></i> Editar
                </button>
                <button
                  class="btn delete"
                  @click="deleteManualConfirm(row._id)"
                >
                  <i class="fas fa-trash"></i> Eliminar
                </button>
              </div>
            </template>
          </data-table-container>
        </template>
      </article>
    </section>
    <!--------------------------------------------------------------------------- Manual Modal -->
    <manual-create-modal @onCreate="handleManualCreated" />
    <manual-delete-modal
      :selectedManualId="selectedManualId"
      @onDelete="handleDelete"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingState from '@/components/LoadingState.vue';
import DataTableContainer from '@/components/tables/DataTableContainer.vue';
import ManualCreateModal from './ManualCreateModal.vue';
import ManualDeleteModal from './ManualDeleteModal.vue';
import ConversionStatus from '@/components/ConversionStatus.vue';
import conversionTracking from '@/mixins/conversionTracking';

export default {
  components: {
    LoadingState,
    DataTableContainer,
    ManualCreateModal,
    ManualDeleteModal,
    ConversionStatus,
  },
  mixins: [conversionTracking],
  data() {
    return {
      selectedManualId: null,
      page: 1,
      pageResults: 10,
      search: '',
      topicSelected: '',
      subtopicSelected: '',
      isInitialLoad: true,
    };
  },
  computed: {
    ...mapGetters({
      loadingState: 'manuals/loadingState',
      manuals: 'manuals/allManuals',
      totalManuals: 'manuals/totalManuals',
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
      return [
        {
          key: 'name',
          label: 'Nombre',
          scope: 'col',
          width: 30,
        },
        {
          key: 'topic_name',
          label: 'Tema',
          scope: 'col',
          width: 25,
          value: (row) => row.topic_name || row.topic,
        },
        {
          key: 'subtopic_name',
          label: 'Subtema',
          scope: 'col',
          width: 20,
          value: (row) => row.subtopic_name || row.subtopic,
        },
        {
          key: 'conversion_status',
          label: 'Estado',
          scope: 'col',
          width: 15,
        },
        {
          key: 'actions',
          label: 'Acciones',
          scope: 'col',
          width: 20,
        },
      ];
    },
    uniqueTopics() {
      // Usar topics del store de Vuex
      if (
        !this.topics ||
        !Array.isArray(this.topics) ||
        this.topics.length === 0
      ) {
        return [];
      }

      // Mapear topics del store a formato para el select
      return this.topics
        .map((topic) => ({
          id: topic.bubble_id,
          name: topic.name || topic.bubble_id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    filteredSubtopics() {
      // Solo mostrar subtopics si hay un topic seleccionado
      if (!this.topicSelected) {
        return [];
      }

      // Buscar el topic seleccionado en el store
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

      // Mapear subtopics del topic seleccionado a formato para el select
      return selectedTopic.subtopics
        .map((subtopic) => ({
          id: subtopic.subtopic || subtopic._id,
          name: subtopic.name || subtopic.subtopic || subtopic._id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  methods: {
    createManual() {
      this.$bvModal.show('manual-create-modal');
    },
    editManual(manualId) {
      this.$router.push({
        path: `/administratorsPages/manuals/${manualId}`,
      });
    },
    deleteManualConfirm(manualId) {
      this.selectedManualId = manualId;
      this.$bvModal.show('manual-delete-modal');
    },
    async handleDelete() {
      await this.$store.dispatch('manuals/deleteManual', this.selectedManualId);
      this.selectedManualId = null;
      // Recargar manuales después de eliminar
      await this.getManuals();
    },
    async handleManualCreated() {
      // Recargar manuales después de crear
      this.page = 1; // Reset a la primera página
      await this.getManuals();
      // El tracking de conversión se iniciará automáticamente desde el store
    },
    getConversionStatusForManual(manualId) {
      return this.$store.getters['manuals/getConversionStatus'](manualId);
    },
    async getManuals() {
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

        await this.$store.dispatch('manuals/fetchManuals', params);
      } catch (err) {
        console.error('Error getting manuals:', err);
      }
    },
    handleSearchUpdate(value) {
      this.search = value;
    },
    searchManuals() {
      this.page = 1;
      this.getManuals();
    },
    handleFilterChange({ key, value }) {
      if (key === 'topic') {
        this.topicSelected = value;
        // Reset subtopic when topic changes
        this.subtopicSelected = '';
        this.page = 1;
        this.getManuals();
      } else if (key === 'subtopic') {
        this.subtopicSelected = value;
        this.page = 1;
        this.getManuals();
      }
    },
    handlePageChange(newPage) {
      this.page = newPage;
      this.getManuals();
    },
    handlePageResultsChange(newPageResults) {
      this.pageResults = newPageResults;
      this.page = 1;
      this.getManuals();
    },
    handleHeaderButtonClick(action) {
      if (action === 'createManual') {
        this.createManual();
      }
    },
  },
  async created() {
    if (process.browser) {
      // El token ahora se configura automáticamente en el plugin de axios
      // Cargar topics desde el store (con persistencia en localStorage)
      await this.$store.dispatch('topics/fetchTopics');
    }
  },
  async mounted() {
    // Configurar header de la página
    this.$store.dispatch('pageHeader/setHeader', {
      title: 'Manuales',
      buttonConfig: {
        type: 'button',
        text: 'Agregar manual',
        icon: 'fas fa-plus',
        action: 'createManual',
      },
    });

    // Escuchar evento del botón del header
    this.$nuxt.$on('page-header-button-click', this.handleHeaderButtonClick);

    await this.getManuals();
    this.isInitialLoad = false;

    // Iniciar polling para manuales en conversión
    this.resumeConversionTracking();
  },
  beforeDestroy() {
    // Limpiar header al salir de la página
    this.$store.dispatch('pageHeader/clearHeader');
    // Remover listener
    this.$nuxt.$off('page-header-button-click', this.handleHeaderButtonClick);
  },
};
</script>

<style lang="scss" scoped>
#manuals {
  .shadow-sm {
    background-color: #ffffff;
    overflow-y: auto;
  }

  .filter-container {
    display: flex;
    flex-direction: row;
    gap: 12px;
    margin-bottom: 20px;
    align-items: center;
    flex-wrap: wrap;

    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 10px 16px;
      border: 1px solid #d4d5d7;
      border-radius: 8px;
      font-size: 14px;
      font-family: Montserrat;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #1ca4fc;
        box-shadow: 0 0 0 3px rgba(28, 164, 252, 0.1);
      }
    }

    .filter-select {
      min-width: 180px;
      padding: 10px 16px;
      border: 1px solid #d4d5d7;
      border-radius: 8px;
      font-size: 14px;
      font-family: Montserrat;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.2s ease;

      &:focus {
        outline: none;
        border-color: #1ca4fc;
        box-shadow: 0 0 0 3px rgba(28, 164, 252, 0.1);
      }

      &:disabled {
        background-color: #f5f5f5;
        cursor: not-allowed;
        opacity: 0.6;
        color: #999;
      }
    }
  }

  .td-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    border: none !important;
    box-shadow: none !important;
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

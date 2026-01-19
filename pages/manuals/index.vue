<template>
  <div id="manuals">
    <section class="manuals-container">
      <article class="full">
        <template>
          <data-table-container
            advanced
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
            :fixed-columns="['name', 'actions']"
            :sortable="[
              'name',
              'topic_name',
              'subtopic_name',
              'conversion_status',
              'updated_at',
            ]"
            :default-sort="sort"
            @update:search="handleSearchUpdate"
            @search="searchManuals"
            @filter-change="handleFilterChange"
            @page-change="handlePageChange"
            @page-results-change="handlePageResultsChange"
            @sort-change="handleSortChange"
          >
            <template #cell-conversion_status="{ row }">
              <conversion-status
                :status="getConversionStatusForManual(row._id)"
                :image-regeneration-status="
                  getImageRegenerationStatusForManual(row._id)
                "
              />
            </template>
            <template #cell-actions="{ row }">
              <div class="td-actions">
                <b-dropdown
                  variant="link"
                  toggle-class="text-decoration-none"
                  no-caret
                  right
                  @shown="onDropdownShown"
                  @hidden="onDropdownHidden"
                >
                  <template #button-content>
                    <i class="fas fa-ellipsis-v"></i>
                  </template>
                  <b-dropdown-item @click="editManual(row._id)">
                    <i class="fas fa-pencil-alt"></i> Editar
                  </b-dropdown-item>
                  <b-dropdown-item @click="regenerateImages(row)">
                    <i class="fas fa-images"></i> Regenerar imágenes
                  </b-dropdown-item>
                  <b-dropdown-divider></b-dropdown-divider>
                  <b-dropdown-item
                    @click="deleteManualConfirm(row._id)"
                    class="text-danger"
                  >
                    <i class="fas fa-trash"></i> Eliminar
                  </b-dropdown-item>
                </b-dropdown>
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
import DataTableContainer from '@/components/tables/data-table-container.vue';
import ManualCreateModal from '@/components/pages/manuals/manual-create.modal.vue';
import ManualDeleteModal from '@/components/pages/manuals/manual-delete.modal.vue';
import ConversionStatus from '@/components/conversion-status.vue';
import conversionTracking from '@/mixins/conversion-tracking';

export default {
  components: {
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
      regeneratingImages: {}, // Map of manualId -> boolean
      imageRegenerationPollingIntervals: {}, // Map of manualId -> intervalId
      sort: { key: 'updated_at', order: 'desc' }, // Estado inicial del sort
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
          width: 250,
        },
        {
          key: 'topic_name',
          label: 'Tema',
          scope: 'col',
          width: 150,
          value: (row) => row.topic_name || row.topic,
        },
        {
          key: 'subtopic_name',
          label: 'Subtema',
          scope: 'col',
          width: 150,
          value: (row) => row.subtopic_name || row.subtopic,
        },
        {
          key: 'conversion_status',
          label: 'Estado',
          scope: 'col',
          width: 200,
        },
        {
          key: 'updated_at',
          label: 'Última actualización',
          scope: 'col',
          width: 150,
          value: (row) =>
            new Date(row.updated_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
        },
        {
          key: 'actions',
          label: 'Acciones',
          scope: 'col',
          width: 200,
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
    onDropdownShown() {
      // Cambiar overflow del contenedor de la tabla para que el dropdown sea visible
      const tableContainer = this.$el.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.style.overflow = 'visible';
      }
    },
    onDropdownHidden() {
      // Restaurar overflow del contenedor de la tabla
      const tableContainer = this.$el.querySelector('.table-container');
      if (tableContainer) {
        tableContainer.style.overflow = '';
      }
    },
    createManual() {
      this.$bvModal.show('manual-create-modal');
    },
    editManual(manualId) {
      this.$router.push({
        path: `/manuals/${manualId}`,
      });
    },
    deleteManualConfirm(manualId) {
      this.selectedManualId = manualId;
      this.$bvModal.show('manual-delete-modal');
    },
    async regenerateImages(manual) {
      if (!manual.file_url) {
        this.$bvToast.toast('El manual no tiene un archivo asociado', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
        return;
      }

      // Verificar si ya está regenerando
      if (this.regeneratingImages[manual._id]) {
        this.$bvToast.toast('La regeneración de imágenes ya está en proceso', {
          title: 'Info',
          variant: 'info',
          solid: true,
        });
        return;
      }

      try {
        this.$set(this.regeneratingImages, manual._id, true);

        // Enviar petición al backend
        await this.$axios.post(`/manuals/${manual._id}/regenerate-images`);

        // Actualizar el estado en la lista inmediatamente
        this.updateManualImageRegenerationStatus(manual._id, {
          status: 'pending',
        });

        this.$bvToast.toast('Regeneración de imágenes iniciada', {
          title: 'Éxito',
          variant: 'success',
          solid: true,
        });

        // Iniciar polling para verificar el estado
        this.startImageRegenerationPolling(manual._id);
      } catch (error) {
        console.error('Error regenerating images:', error);
        this.$bvToast.toast('Error al iniciar la regeneración de imágenes', {
          title: 'Error',
          variant: 'danger',
          solid: true,
        });
        this.$set(this.regeneratingImages, manual._id, false);
      }
    },
    startImageRegenerationPolling(manualId) {
      // Si ya hay un polling activo, no crear otro
      if (this.imageRegenerationPollingIntervals[manualId]) {
        return;
      }

      // Polling cada 5 segundos para verificar el estado
      const intervalId = setInterval(async () => {
        try {
          // Verificar el estado de regeneración de imágenes
          const response = await this.$axios.get(
            `/manuals/${manualId}/image-regeneration-status`
          );
          const status =
            response.data.payload || response.data.data || response.data;

          // Si el estado es null, significa que no hay regeneración en curso
          if (!status.status) {
            this.stopImageRegenerationPolling(manualId);
            this.$set(this.regeneratingImages, manualId, false);
            return;
          }

          // Si la regeneración está completa
          if (status.status === 'completed') {
            this.stopImageRegenerationPolling(manualId);
            this.$set(this.regeneratingImages, manualId, false);

            // Actualizar el estado en la lista de manuales
            this.updateManualImageRegenerationStatus(manualId, status);

            this.$bvToast.toast('Regeneración de imágenes completada', {
              title: 'Éxito',
              variant: 'success',
              solid: true,
            });

            // Recargar manuales después de un breve delay
            setTimeout(() => {
              this.getManuals();
            }, 1000);
          } else if (status.status === 'failed') {
            this.stopImageRegenerationPolling(manualId);
            this.$set(this.regeneratingImages, manualId, false);

            // Actualizar el estado en la lista de manuales
            this.updateManualImageRegenerationStatus(manualId, status);

            this.$bvToast.toast(
              `Error en la regeneración: ${
                status.error || 'Error desconocido'
              }`,
              {
                title: 'Error',
                variant: 'danger',
                solid: true,
              }
            );
          } else if (
            status.status === 'processing' ||
            status.status === 'pending'
          ) {
            // Actualizar el estado mientras está procesando
            this.updateManualImageRegenerationStatus(manualId, status);
          }
        } catch (error) {
          console.error('Error checking image regeneration status:', error);
          // Continuar polling en caso de error temporal
        }
      }, 5000); // Verificar cada 5 segundos

      this.imageRegenerationPollingIntervals[manualId] = intervalId;

      // Limitar el tiempo máximo de polling a 5 minutos
      setTimeout(() => {
        if (this.imageRegenerationPollingIntervals[manualId]) {
          this.stopImageRegenerationPolling(manualId);
          this.$set(this.regeneratingImages, manualId, false);
          this.$bvToast.toast(
            'El tiempo de espera para la regeneración de imágenes ha expirado',
            {
              title: 'Advertencia',
              variant: 'warning',
              solid: true,
            }
          );
        }
      }, 300000); // 5 minutos
    },
    stopImageRegenerationPolling(manualId) {
      if (this.imageRegenerationPollingIntervals[manualId]) {
        clearInterval(this.imageRegenerationPollingIntervals[manualId]);
        delete this.imageRegenerationPollingIntervals[manualId];
      }
    },
    updateManualImageRegenerationStatus(manualId, status) {
      // Actualizar el estado de regeneración de imágenes en la lista de manuales
      const manual = this.manuals?.find((m) => m._id === manualId);
      if (manual) {
        this.$set(manual, 'image_regeneration_status', status.status);
        if (status.error) {
          this.$set(manual, 'image_regeneration_error', status.error);
        }
      }
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
    getImageRegenerationStatusForManual(manualId) {
      // Obtener el estado de regeneración de imágenes desde el manual en la lista
      const manual = this.manuals?.find((m) => m._id === manualId);
      if (!manual || !manual.image_regeneration_status) {
        return null;
      }
      return {
        status: manual.image_regeneration_status,
        error: manual.image_regeneration_error,
      };
    },
    async getManuals() {
      try {
        const params = {
          page: this.page,
          pageResults: this.pageResults,
          sort: this.sort?.key || 'updated_at',
          order: this.sort?.order || 'desc',
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

        if (this.sort && this.sort.key) {
          params.sort = this.sort.key;
          params.order = this.sort.order;
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
    handleSortChange(sortInfo) {
      this.sort = sortInfo;
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
    // Limpiar todos los intervals de polling
    Object.keys(this.imageRegenerationPollingIntervals).forEach((manualId) => {
      this.stopImageRegenerationPolling(manualId);
    });
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

  ::v-deep .table thead th {
    font-family: Montserrat !important;
    font-size: 14px;
    text-transform: capitalize;
  }

  ::v-deep .table tbody td {
    font-family: Montserrat !important;
    font-size: 13px;
    font-weight: 500;
  }

  .td-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    position: relative;
    z-index: 1;
  }

  .td-actions ::v-deep .btn-link {
    color: #6c757d;
    padding: 4px 8px;
    border: none;
    background: transparent;
    font-size: 16px;
    position: relative;
    z-index: 1;

    &:hover {
      color: #495057;
    }

    &:focus {
      box-shadow: none;
    }
  }

  .td-actions ::v-deep .dropdown {
    position: relative;
    z-index: 100;
  }

  .td-actions ::v-deep .dropdown-menu {
    min-width: 220px;
    padding: 8px 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    z-index: 9999 !important;
    position: absolute !important;
    margin-top: 0 !important;
  }

  .td-actions ::v-deep .show > .dropdown-menu {
    display: block !important;
    z-index: 9999 !important;
  }

  .td-actions ::v-deep .dropdown.show {
    z-index: 100;
    position: relative;
  }

  .td-actions ::v-deep .dropdown-item {
    padding: 8px 16px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #212529;

    i {
      width: 16px;
      text-align: center;
    }

    &:hover {
      background-color: #f8f9fa;
      color: #212529;
    }

    &.text-danger {
      color: #dc3545 !important;

      &:hover {
        background-color: #fff5f5;
        color: #dc3545 !important;
      }
    }
  }
}
</style>

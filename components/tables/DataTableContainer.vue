<!-- eslint-disable vue/no-deprecated-dollar-scopedslots-api -->
<!-- eslint-disable vue/no-deprecated-slot-attribute -->
<!-- eslint-disable vue/no-deprecated-slot-scope-attribute -->
<template>
  <div class="data-table-container">
    <!-- Toolbar con búsqueda y filtros -->
    <filter-toolbar-skeleton
      v-if="showToolbar && loading && showFullLoader"
      :filter-count="filters.length || 2"
    />
    <filter-toolbar
      v-else-if="showToolbar"
      :search="search"
      :search-placeholder="searchPlaceholder"
      :filters="filters"
      :model-value="filterValues"
      @update:search="handleSearchUpdate"
      @update:model-value="handleFiltersUpdate"
      @search="handleSearch"
      @filter-change="handleFilterChange"
    />

    <!-- Tabla de datos -->
    <data-table
      :data="data"
      :columns="columns"
      :loading="loading"
      :loading-message="loadingMessage"
      :show-full-loader="showFullLoader"
      :current-page="currentPage"
      :page-results="pageResults"
      :total="total"
      :total-label="totalLabel"
      :page-size-options="pageSizeOptions"
      :empty-message="emptyMessage"
      :show-pagination="showPagination"
      :thead-class="theadClass"
      :tbody-class="tbodyClass"
      :row-key="rowKey"
      @page-change="handlePageChange"
      @page-results-change="handlePageResultsChange"
    >
      <!-- Pasar todos los slots scoped al DataTable -->
      <template
        v-for="slot in Object.keys($scopedSlots || {})"
        :slot="slot"
        slot-scope="scope"
      >
        <slot :name="slot" v-bind="scope" />
      </template>
    </data-table>
  </div>
</template>

<script>
import FilterToolbar from './FilterToolbar.vue';
import FilterToolbarSkeleton from './FilterToolbarSkeleton.vue';
import DataTable from './DataTable.vue';

export default {
  name: 'DataTableContainer',
  components: {
    FilterToolbar,
    FilterToolbarSkeleton,
    DataTable,
  },
  props: {
    // Datos de la tabla
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    columns: {
      type: Array,
      required: true,
      default: () => [],
    },
    // Estado de carga
    loading: {
      type: Boolean,
      default: false,
    },
    loadingMessage: {
      type: String,
      default: 'Cargando datos...',
    },
    showFullLoader: {
      type: Boolean,
      default: false,
    },
    // Toolbar
    showToolbar: {
      type: Boolean,
      default: true,
    },
    search: {
      type: String,
      default: '',
    },
    searchPlaceholder: {
      type: String,
      default: 'Buscar...',
    },
    filters: {
      type: Array,
      default: () => [],
    },
    filterValues: {
      type: Object,
      default: () => ({}),
    },
    // Paginación
    currentPage: {
      type: Number,
      default: 1,
    },
    pageResults: {
      type: Number,
      default: 10,
    },
    total: {
      type: Number,
      default: 0,
    },
    totalLabel: {
      type: String,
      default: 'registros',
    },
    pageSizeOptions: {
      type: Array,
      default: () => [5, 10, 15, 20, 25],
    },
    // Mensajes
    emptyMessage: {
      type: String,
      default: 'No hay datos disponibles',
    },
    // Clases CSS
    theadClass: {
      type: String,
      default: 'thead-admin',
    },
    tbodyClass: {
      type: String,
      default: 'tbody',
    },
    // Otros
    showPagination: {
      type: Boolean,
      default: true,
    },
    rowKey: {
      type: [String, Function],
      default: '_id',
    },
  },
  emits: [
    'update:search',
    'update:filterValues',
    'update:currentPage',
    'update:pageResults',
    'search',
    'filter-change',
    'page-change',
    'page-results-change',
  ],
  methods: {
    handleSearchUpdate(value) {
      this.$emit('update:search', value);
    },
    handleFiltersUpdate(value) {
      this.$emit('update:filterValues', value);
    },
    handleSearch(value) {
      this.$emit('search', value);
    },
    handleFilterChange({ key, value }) {
      this.$emit('filter-change', { key, value });
    },
    handlePageChange(page) {
      this.$emit('update:currentPage', page);
      this.$emit('page-change', page);
    },
    handlePageResultsChange(pageResults) {
      this.$emit('update:pageResults', pageResults);
      this.$emit('page-results-change', pageResults);
    },
  },
};
</script>

<style lang="scss" scoped>
.data-table-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>

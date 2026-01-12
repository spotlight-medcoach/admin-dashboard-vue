<template>
  <div class="advanced-data-table-wrapper">
    <table-skeleton
      v-if="loading"
      :columns="columns"
      :rows="5"
      :thead-class="theadClass"
      :tbody-class="tbodyClass"
    />
    <template v-else>
      <div class="table-scroll-container">
        <div class="table-container">
          <table
            class="table table-bordered"
            ref="tableRef"
            :style="{ minWidth: totalTableWidth }"
          >
            <thead :class="theadClass">
              <tr>
                <th
                  v-for="(column, colIndex) in columns"
                  :key="column.key"
                  :scope="column.scope || 'col'"
                  :class="getHeaderClass(column)"
                  :style="getHeaderStyle(column, colIndex)"
                >
                  <div class="header-content">
                    <span
                      v-if="isSortable(column.key)"
                      class="sortable-header"
                      @click="handleSort(column.key)"
                    >
                      {{ column.label }}
                      <span class="sort-indicator">
                        <i
                          v-if="currentSort.key === column.key"
                          :class="
                            currentSort.order === 'asc'
                              ? 'fas fa-sort-up'
                              : 'fas fa-sort-down'
                          "
                        ></i>
                        <i v-else class="fas fa-sort" style="opacity: 0.3"></i>
                      </span>
                    </span>
                    <span v-else>{{ column.label }}</span>
                    <div
                      v-if="colIndex < columns.length - 1"
                      class="resize-handle"
                      @mousedown="startResize(column.key, $event)"
                    ></div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody :class="tbodyClass">
              <tr v-for="(row, index) in data" :key="getRowKey(row, index)">
                <td
                  v-for="(column, colIndex) in columns"
                  :key="column.key"
                  :class="[
                    getCellClass(column, row),
                    getFixedCellClass(column),
                  ]"
                  :style="getCellStyle(column, colIndex)"
                >
                  <slot
                    :name="`cell-${column.key}`"
                    :row="row"
                    :column="column"
                    :value="getCellValue(row, column)"
                  >
                    {{ getCellValue(row, column) }}
                  </slot>
                </td>
              </tr>
              <tr v-if="!data || data.length === 0">
                <td :colspan="columns.length" class="text-center">
                  {{ emptyMessage }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="showPagination" class="pagination-container">
        <div class="select-container">
          <span>Resultados por página: </span>
          <select
            v-model="localPageResults"
            class="basic-select"
            @change="handlePageResultsChange"
          >
            <option
              v-for="option in pageSizeOptions"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </div>

        <div class="arrows-container">
          <span>
            {{ total === 0 ? 0 : (currentPage - 1) * localPageResults + 1 }} -
            {{
              localPageResults > total
                ? total
                : currentPage * localPageResults > total
                ? total
                : currentPage * localPageResults
            }}
            de {{ total }} {{ totalLabel }}
          </span>
          <button
            class="btn btn-pagination"
            @click="handlePrevious"
            :disabled="isPreviousDisabled"
            title="Anterior"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 9L4.5 6L7.5 3"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button
            class="btn btn-pagination"
            @click="handleNext"
            :disabled="isNextDisabled"
            title="Siguiente"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 3L7.5 6L4.5 9"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import TableSkeleton from './table-skeleton.vue';

export default {
  name: 'AdvancedDataTable',
  components: {
    TableSkeleton,
  },
  props: {
    // Datos de la tabla
    data: {
      type: Array,
      required: true,
      default: () => [],
    },
    // Columnas de la tabla
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
    // Paginación
    showPagination: {
      type: Boolean,
      default: true,
    },
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
    // Clases CSS
    theadClass: {
      type: String,
      default: 'thead-admin',
    },
    tbodyClass: {
      type: String,
      default: 'tbody',
    },
    // Mensajes
    emptyMessage: {
      type: String,
      default: 'No hay datos disponibles',
    },
    // Función para obtener la key única de cada fila
    rowKey: {
      type: [String, Function],
      default: '_id',
    },
    // Funcionalidades avanzadas
    sortable: {
      type: Array,
      default: () => [],
    },
    defaultSort: {
      type: Object,
      default: () => ({ key: 'created_at', order: 'desc' }),
    },
    fixedColumns: {
      type: Array,
      default: () => [],
    },
    columnWidths: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      localPageResults: this.pageResults,
      currentSort: {
        key: this.defaultSort.key || 'created_at',
        order: this.defaultSort.order || 'desc',
      },
      columnWidthsState: { ...this.columnWidths },
      resizingState: {
        isResizing: false,
        columnKey: null,
        startX: 0,
        startWidth: 0,
      },
    };
  },
  computed: {
    isPreviousDisabled() {
      return this.currentPage === 1;
    },
    isNextDisabled() {
      return this.currentPage * this.localPageResults >= this.total;
    },
    totalTableWidth() {
      let total = 0;
      this.columns.forEach((column) => {
        const width = this.getColumnWidth(column);
        if (width) {
          if (typeof width === 'number') {
            // Si es un número, asumimos que son píxeles
            total += width;
          } else if (typeof width === 'string') {
            // Si es string, intentar extraer el número de píxeles
            const match = width.match(/(\d+)px/);
            if (match) {
              total += parseInt(match[1], 10);
            }
          }
        }
      });
      // Si hay columnas con ancho, usar el total, sino 100%
      return total > 0 ? `${total}px` : '100%';
    },
  },
  watch: {
    pageResults(newVal) {
      this.localPageResults = newVal;
    },
    defaultSort: {
      handler(newVal) {
        if (newVal && newVal.key) {
          this.currentSort = {
            key: newVal.key,
            order: newVal.order || 'desc',
          };
        }
      },
      immediate: true,
    },
  },
  mounted() {
    document.addEventListener('mousemove', this.doResize);
    document.addEventListener('mouseup', this.stopResize);
    this.initializeColumnWidths();
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.doResize);
    document.removeEventListener('mouseup', this.stopResize);
  },
  methods: {
    getRowKey(row, index) {
      if (typeof this.rowKey === 'function') {
        return this.rowKey(row, index);
      }
      return row[this.rowKey] || index;
    },
    getCellValue(row, column) {
      if (column.value) {
        if (typeof column.value === 'function') {
          return column.value(row);
        }
        return row[column.value];
      }
      return row[column.key];
    },
    getCellClass(column, row) {
      if (column.cellClass) {
        if (typeof column.cellClass === 'function') {
          return column.cellClass(row);
        }
        return column.cellClass;
      }
      return '';
    },
    getFixedCellClass(column) {
      if (this.fixedColumns.includes(column.key)) {
        const isFirst =
          this.columns.findIndex((c) => c.key === column.key) === 0;
        const isLast =
          this.columns.findIndex((c) => c.key === column.key) ===
          this.columns.length - 1;
        return {
          'fixed-left': isFirst,
          'fixed-right': isLast,
        };
      }
      return '';
    },
    getHeaderClass(column) {
      const classes = [];
      if (this.fixedColumns.includes(column.key)) {
        const isFirst =
          this.columns.findIndex((c) => c.key === column.key) === 0;
        const isLast =
          this.columns.findIndex((c) => c.key === column.key) ===
          this.columns.length - 1;
        if (isFirst) classes.push('fixed-left');
        if (isLast) classes.push('fixed-right');
      }
      if (this.isSortable(column.key)) {
        classes.push('sortable');
      }
      return classes;
    },
    getHeaderStyle(column, colIndex) {
      const styles = {};
      const width = this.getColumnWidth(column);
      if (width) {
        if (typeof width === 'number') {
          // Si es un número, asumimos que son píxeles
          styles.width = `${width}px`;
          styles.minWidth = `${width}px`;
        } else {
          // Si es string, puede ser '200px', '20%', etc.
          styles.width = width;
          styles.minWidth = width;
        }
        styles.maxWidth = styles.width;
      }
      if (this.fixedColumns.includes(column.key)) {
        styles.position = 'sticky';
        styles.zIndex = 20;
        if (colIndex === 0) {
          styles.left = 0;
        } else if (colIndex === this.columns.length - 1) {
          styles.right = 0;
        }
      }
      return styles;
    },
    getCellStyle(column, colIndex) {
      const styles = {};
      const width = this.getColumnWidth(column);
      if (width) {
        if (typeof width === 'number') {
          // Si es un número, asumimos que son píxeles
          styles.width = `${width}px`;
          styles.minWidth = `${width}px`;
        } else {
          // Si es string, puede ser '200px', '20%', etc.
          styles.width = width;
          styles.minWidth = width;
        }
        styles.maxWidth = styles.width;
      }
      if (this.fixedColumns.includes(column.key)) {
        styles.position = 'sticky';
        styles.zIndex = 15;
        if (colIndex === 0) {
          styles.left = 0;
        } else if (colIndex === this.columns.length - 1) {
          styles.right = 0;
        }
      }
      return styles;
    },
    getColumnWidth(column) {
      if (this.columnWidthsState[column.key]) {
        return this.columnWidthsState[column.key];
      }
      if (column.width) {
        return column.width;
      }
      return null;
    },
    initializeColumnWidths() {
      this.columns.forEach((column) => {
        if (column.width && !this.columnWidthsState[column.key]) {
          this.columnWidthsState[column.key] = column.width;
        }
      });
    },
    isSortable(columnKey) {
      return this.sortable.includes(columnKey);
    },
    handleSort(columnKey) {
      if (!this.isSortable(columnKey)) return;

      if (this.currentSort.key === columnKey) {
        // Cambiar dirección
        this.currentSort.order =
          this.currentSort.order === 'asc' ? 'desc' : 'asc';
      } else {
        // Nueva columna, empezar con desc
        this.currentSort = {
          key: columnKey,
          order: 'desc',
        };
      }

      this.$emit('sort-change', {
        key: this.currentSort.key,
        order: this.currentSort.order,
      });
    },
    startResize(columnKey, event) {
      event.preventDefault();
      event.stopPropagation();
      const column = this.columns.find((c) => c.key === columnKey);
      if (!column) return;

      const currentWidth = this.getColumnWidth(column);
      const widthValue =
        typeof currentWidth === 'number'
          ? currentWidth
          : parseFloat(currentWidth) || 0;

      this.resizingState = {
        isResizing: true,
        columnKey,
        startX: event.clientX,
        startWidth: widthValue,
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    doResize(event) {
      if (!this.resizingState.isResizing) return;

      event.preventDefault();
      const table = this.$refs.tableRef;
      if (!table) return;

      const tableRect = table.getBoundingClientRect();
      const deltaX = event.clientX - this.resizingState.startX;
      const tableWidth = tableRect.width;
      const deltaPercent = (deltaX / tableWidth) * 100;

      const newWidth = this.resizingState.startWidth + deltaPercent;
      const minWidth = 5; // 5% mínimo
      const maxWidth = 50; // 50% máximo

      if (newWidth >= minWidth && newWidth <= maxWidth) {
        this.columnWidthsState[this.resizingState.columnKey] = newWidth;
        this.$forceUpdate();
      }
    },
    stopResize() {
      if (this.resizingState.isResizing) {
        this.resizingState = {
          isResizing: false,
          columnKey: null,
          startX: 0,
          startWidth: 0,
        };
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    },
    handlePageResultsChange() {
      this.$emit('page-results-change', this.localPageResults);
    },
    handlePrevious() {
      if (!this.isPreviousDisabled) {
        this.$emit('page-change', this.currentPage - 1);
      }
    },
    handleNext() {
      if (!this.isNextDisabled) {
        this.$emit('page-change', this.currentPage + 1);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.advanced-data-table-wrapper {
  width: 100%;

  .table-scroll-container {
    margin: 20px 0px;
    border-radius: 15px;
    overflow-x: auto;
    overflow-y: visible;
    border: 1px solid #dee2e6;
    position: relative;
    -webkit-overflow-scrolling: touch;
    // Forzar scroll horizontal cuando el contenido sea más ancho
    display: block;
    width: 100%;
  }

  .table-container {
    min-width: 100%;
    width: 100%;
    display: table;
  }

  .table {
    table-layout: fixed;
    width: auto;
    margin-bottom: 0;
    border-collapse: separate;
    border-spacing: 0;
    border: none;
  }

  .thead-admin {
    background: #212529;
    color: #fff;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 15px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .thead-admin th {
    border-top: none;
    border-left: none;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    background: #212529;
  }

  .thead-admin th:first-child {
    border-left: none;
    border-radius: 15px 0px 0px 0px;
  }

  .thead-admin th:last-child {
    border-right: none;
    border-radius: 0px 15px 0px 0px;
  }

  .thead-admin th.fixed-left {
    z-index: 25;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }

  .thead-admin th.fixed-right {
    z-index: 25;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  }

  // Asegurar que las celdas con dropdowns abiertos tengan z-index alto
  td:has(.dropdown.show) {
    z-index: 100 !important;
    position: relative;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    padding-right: 8px;
  }

  .sortable-header {
    cursor: pointer;
    user-select: none;
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;

    &:hover {
      opacity: 0.8;
    }
  }

  .sort-indicator {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    margin-left: 4px;
  }

  .resize-handle {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: col-resize;
    background: transparent;
    z-index: 20;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .tbody {
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 18px;
    color: #212529;
  }

  td {
    vertical-align: middle;
    padding: 12px 8px;
    border-top: none;
    border-left: none;
    border-right: 1px solid #dee2e6;
    border-bottom: 1px solid #dee2e6;
    background: #fff;
  }

  td:first-child {
    border-left: none;
  }

  td:last-child {
    border-right: none;
  }

  td.fixed-left {
    z-index: 20;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
    background: #fff;
  }

  td.fixed-right {
    z-index: 20;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.05);
    background: #fff;
  }

  // Asegurar que las celdas con dropdowns abiertos tengan z-index alto
  td:has(.dropdown.show) {
    z-index: 100 !important;
    position: relative;
  }

  .tbody tr:last-child td:first-child {
    border-radius: 0px 0px 0px 15px;
  }

  .tbody tr:last-child td:last-child {
    border-radius: 0px 0px 15px 0px;
  }

  .tbody tr:last-child td {
    border-bottom: none;
  }

  .text-center {
    text-align: center;
    padding: 20px;
    color: #999;
  }

  .pagination-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding: 16px 0;
    flex-wrap: wrap;
    gap: 16px;

    .select-container {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-family: Montserrat;
      color: #212529;

      .basic-select {
        padding: 8px 12px;
        border: 1px solid #d4d5d7;
        border-radius: 8px;
        font-size: 14px;
        font-family: Montserrat;
        background-color: #fff;
        cursor: pointer;
        min-width: 80px;

        &:focus {
          outline: none;
          border-color: #1ca4fc;
        }
      }
    }

    .arrows-container {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      font-family: Montserrat;
      color: #212529;

      .btn-pagination {
        width: 36px;
        height: 36px;
        border: 1px solid #d4d5d7;
        border-radius: 8px;
        background-color: #fff;
        color: #5f5f5f;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        padding: 0;

        svg {
          width: 12px;
          height: 12px;
        }

        &:hover:not(:disabled) {
          background-color: #e9f6ff;
          border-color: #1ca4fc;
          color: #1ca4fc;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          color: #999;
        }
      }
    }
  }
}
</style>

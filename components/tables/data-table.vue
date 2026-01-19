<template>
  <div class="data-table-wrapper">
    <table-skeleton
      v-if="loading"
      :columns="columns"
      :rows="5"
      :thead-class="theadClass"
      :tbody-class="tbodyClass"
    />
    <template v-else>
      <div class="table-container">
        <table class="table table-bordered">
          <thead :class="theadClass">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :scope="column.scope || 'col'"
                :style="getColumnStyle(column)"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody :class="tbodyClass">
            <tr v-for="(row, index) in data" :key="getRowKey(row, index)">
              <td
                v-for="column in columns"
                :key="column.key"
                :class="getCellClass(column, row)"
                :style="getColumnStyle(column)"
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
            {{ total === 0 ? 0 : (currentPage - 1) * localPageResults + 1 }}
            -
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
  name: 'DataTable',
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
  },
  data() {
    return {
      localPageResults: this.pageResults,
    };
  },
  computed: {
    isPreviousDisabled() {
      return this.currentPage === 1;
    },
    isNextDisabled() {
      return this.currentPage * this.localPageResults >= this.total;
    },
  },
  watch: {
    pageResults(newVal) {
      this.localPageResults = newVal;
    },
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
    getColumnStyle(column) {
      if (column.width) {
        return {
          width:
            typeof column.width === 'number'
              ? `${column.width}%`
              : column.width,
        };
      }
      return {};
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
.data-table-wrapper {
  width: 100%;

  .table-loading {
    padding: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .table-container {
    margin: 20px 0px;
    border-radius: 15px;
    overflow: hidden;
    border: 1px solid #dee2e6;
  }

  .table {
    table-layout: fixed;
    width: 100%;
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
  }

  .thead-admin th:first-child {
    border-radius: 15px 0px 0px 0px;
    border-left: none;
    -moz-border-radius: 15px 0px 0px 0px;
    -webkit-border-radius: 15px 0px 0px 0px;
  }

  .thead-admin th:last-child {
    border-radius: 0px 15px 0px 0px;
    border-right: none;
    -moz-border-radius: 0px 15px 0px 0px;
    -webkit-border-radius: 0px 15px 0px 0px;
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
  }

  td:first-child {
    border-left: none;
  }

  td:last-child {
    border-right: none;
  }

  .tbody tr:last-child td:first-child {
    border-radius: 0px 0px 0px 15px;
    -moz-border-radius: 0px 0px 0px 15px;
    -webkit-border-radius: 0px 0px 0px 15px;
  }

  .tbody tr:last-child td:last-child {
    border-radius: 0px 0px 15px 0px;
    -moz-border-radius: 0px 0px 15px 0px;
    -webkit-border-radius: 0px 0px 15px 0px;
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

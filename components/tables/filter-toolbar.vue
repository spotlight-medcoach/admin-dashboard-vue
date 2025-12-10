<template>
  <div class="filter-toolbar">
    <div class="filter-container">
      <!-- Search Input -->
      <input
        v-model="localSearch"
        type="text"
        :placeholder="searchPlaceholder"
        class="search-input"
        @keyup.enter="handleSearch"
        @input="handleSearchInput"
      />

      <!-- Dynamic Filters -->
      <select
        v-for="(filter, index) in filters"
        :key="filter.key || index"
        v-model="localFilters[filter.key]"
        class="filter-select"
        :disabled="
          filter.disabled ||
          (filter.dependsOn && !localFilters[filter.dependsOn])
        "
        @change="handleFilterChange(filter.key)"
      >
        <option :value="filter.defaultValue || ''">
          {{ getFilterPlaceholder(filter) }}
        </option>
        <option
          v-for="option in getFilterOptions(filter)"
          :key="option.id || option.value"
          :value="option.id || option.value"
        >
          {{ option.name || option.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterToolbar',
  props: {
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
      // Formato esperado:
      // [
      //   {
      //     key: 'topic',
      //     label: 'Tema',
      //     options: [], // Array de { id, name } o { value, label }
      //     defaultValue: '',
      //     dependsOn: null, // Clave de otro filtro del que depende
      //     disabled: false,
      //     placeholder: 'Todos los temas'
      //   }
      // ]
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:search', 'update:modelValue', 'search', 'filter-change'],
  data() {
    return {
      localSearch: this.search,
      localFilters: { ...this.modelValue },
      searchTimeout: null,
    };
  },
  watch: {
    search(newVal) {
      this.localSearch = newVal;
    },
    modelValue: {
      handler(newVal) {
        this.localFilters = { ...newVal };
      },
      deep: true,
    },
    localFilters: {
      handler(newVal) {
        this.$emit('update:modelValue', { ...newVal });
      },
      deep: true,
    },
  },
  methods: {
    handleSearch() {
      this.$emit('update:search', this.localSearch);
      this.$emit('search', this.localSearch);
    },
    handleSearchInput() {
      // Debounce: esperar 500ms después de que el usuario deje de escribir para ejecutar la búsqueda
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      this.searchTimeout = setTimeout(() => {
        this.$emit('update:search', this.localSearch);
        this.$emit('search', this.localSearch);
      }, 500);
    },
    handleFilterChange(filterKey) {
      const value = this.localFilters[filterKey];
      this.$emit('filter-change', { key: filterKey, value });
    },
    getFilterPlaceholder(filter) {
      if (filter.dependsOn && !this.localFilters[filter.dependsOn]) {
        return filter.dependsOnPlaceholder || 'Selecciona primero...';
      }
      return filter.placeholder || `Todos los ${filter.label.toLowerCase()}`;
    },
    getFilterOptions(filter) {
      // Si el filtro tiene una función para obtener opciones, usarla
      if (typeof filter.getOptions === 'function') {
        try {
          const options = filter.getOptions(this.localFilters);
          return Array.isArray(options) ? options : [];
        } catch (err) {
          console.error('Error getting filter options:', err);
          return [];
        }
      }
      // Si tiene opciones estáticas, usarlas
      if (Array.isArray(filter.options)) {
        return filter.options;
      }
      return [];
    },
  },
  beforeDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },
};
</script>

<style lang="scss" scoped>
.filter-toolbar {
  width: 100%;
  margin-bottom: 20px;

  .filter-container {
    display: flex;
    flex-direction: row;
    gap: 12px;
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
}
</style>

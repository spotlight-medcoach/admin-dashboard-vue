<template>
  <div class="table-skeleton">
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
              <div class="skeleton-header"></div>
            </th>
          </tr>
        </thead>
        <tbody :class="tbodyClass">
          <tr v-for="n in rows" :key="n">
            <td
              v-for="column in columns"
              :key="column.key"
              :style="getColumnStyle(column)"
            >
              <div class="skeleton-cell"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableSkeleton',
  props: {
    columns: {
      type: Array,
      required: true,
      default: () => [],
    },
    rows: {
      type: Number,
      default: 5,
    },
    theadClass: {
      type: String,
      default: 'thead-admin',
    },
    tbodyClass: {
      type: String,
      default: 'tbody',
    },
  },
  methods: {
    getColumnStyle(column) {
      if (column.width) {
        return {
          width: typeof column.width === 'number' ? `${column.width}%` : column.width,
        };
      }
      return {};
    },
  },
};
</script>

<style lang="scss" scoped>
.table-skeleton {
  width: 100%;

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

  .thead-admin th {
    border-top: none;
    border-left: none;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding: 12px 8px;
  }

  .skeleton-header {
    height: 14px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    animation: skeleton-loading 1.5s ease-in-out infinite;
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

  .skeleton-cell {
    height: 16px;
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200% 100%;
    border-radius: 4px;
    animation: skeleton-loading 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
}
</style>


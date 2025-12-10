<template>
  <div class="filter-toolbar-skeleton">
    <div class="filter-container">
      <!-- Search Input Skeleton -->
      <div class="skeleton-search-input"></div>

      <!-- Filter Selects Skeleton -->
      <div
        v-for="n in filterCount"
        :key="n"
        class="skeleton-filter-select"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterToolbarSkeleton',
  props: {
    filterCount: {
      type: Number,
      default: 2,
    },
  },
};
</script>

<style lang="scss" scoped>
.filter-toolbar-skeleton {
  width: 100%;
  margin-bottom: 20px;

  .filter-container {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    .skeleton-search-input {
      flex: 1;
      min-width: 200px;
      height: 40px;
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
      );
      background-size: 200% 100%;
      border-radius: 8px;
      animation: skeleton-loading 1.5s ease-in-out infinite;
    }

    .skeleton-filter-select {
      min-width: 180px;
      height: 40px;
      background: linear-gradient(
        90deg,
        #f0f0f0 25%,
        #e0e0e0 50%,
        #f0f0f0 75%
      );
      background-size: 200% 100%;
      border-radius: 8px;
      animation: skeleton-loading 1.5s ease-in-out infinite;
    }
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


<template>
  <div class="layout-wrapper" :class="{ 'has-sidebar': hasSidebar }">
    <Nuxt />
  </div>
</template>

<script>
export default {
  data() {
    return {
      hasSidebar: false,
    };
  },
  mounted() {
    if (process.browser) {
      this.updateSidebarState();
      // Escuchar cambios en localStorage
      window.addEventListener("storage", this.handleStorageChange);
      // Escuchar evento personalizado para cambios en el mismo tab
      window.addEventListener("navigation-changed", this.updateSidebarState);
      // Polling como fallback
      this.intervalId = setInterval(this.updateSidebarState, 200);
    }
  },
  beforeDestroy() {
    if (process.browser) {
      window.removeEventListener("storage", this.handleStorageChange);
      window.removeEventListener("navigation-changed", this.updateSidebarState);
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    }
  },
  methods: {
    updateSidebarState() {
      if (!process.browser) return;
      const mode = localStorage.getItem("navigation_mode");
      const sidebarVisible = localStorage.getItem("sidebar_visible");
      this.hasSidebar = mode === "lateral" && sidebarVisible === "true";
    },
    handleStorageChange(e) {
      if (e.key === "navigation_mode" || e.key === "sidebar_visible") {
        this.updateSidebarState();
      }
    },
  },
};
</script>

<style>
html {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.layout-wrapper {
  min-height: 100vh;
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-wrapper.has-sidebar {
  padding-left: 280px;
}

@media (max-width: 768px) {
  .layout-wrapper.has-sidebar {
    padding-left: 0;
  }
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>

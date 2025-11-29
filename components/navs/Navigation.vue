<template>
  <div>
    <!-- Menú Superior (Horizontal) -->
    <header
      v-if="menuMode === 'horizontal'"
      class="head-navigation head-navigation-horizontal"
      :class="{ 'sidebar-open': sidebarVisible && menuMode === 'lateral' }"
    >
      <img src="../../assets/images/logo.svg" alt="" />

      <nav class="nav nav-horizontal">
        <NavigationGroup
          v-for="group in menuItems"
          :key="group.group"
          :group-name="group.group"
          :group-icon="group.icon"
          :items="group.items"
          :mode="menuMode"
          :default-expanded="true"
        />
      </nav>

      <div class="controls">
        <button
          class="btn-toggle-mode"
          @click="toggleMenuMode"
          :title="
            menuMode === 'horizontal'
              ? 'Cambiar a menú lateral'
              : 'Cambiar a menú superior'
          "
        >
          <i
            :class="
              menuMode === 'horizontal'
                ? 'fas fa-bars'
                : 'fas fa-window-maximize'
            "
          ></i>
        </button>

        <div class="profile">
          <div class="btn-group">
            <button
              type="button"
              class="btn dropdown-toggle-split"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i class="fas fa-bars"></i>
            </button>

            <div class="dropdown-menu">
              <button class="btn" @click="profile">
                <i class="fas fa-user-alt mr-2"></i> Perfil
              </button>
              <button class="btn" @click="logout">
                <i class="fas fa-sign-in-alt mr-2"></i> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Menú Lateral -->
    <div
      v-if="menuMode === 'lateral'"
      class="sidebar-wrapper"
      :class="{
        'sidebar-visible': sidebarVisible,
        'sidebar-hidden': !sidebarVisible,
      }"
    >
      <!-- Overlay para móviles -->
      <div
        v-if="sidebarVisible"
        class="sidebar-overlay"
        @click="toggleSidebar"
      ></div>

      <!-- Sidebar -->
      <aside class="sidebar" :class="{ 'sidebar-open': sidebarVisible }">
        <div class="sidebar-header">
          <img src="../../assets/images/logo.svg" alt="" class="sidebar-logo" />
          <button
            class="btn-close-sidebar"
            @click="toggleSidebar"
            title="Cerrar menú"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <nav class="nav nav-lateral">
          <NavigationGroup
            v-for="group in menuItems"
            :key="group.group"
            :group-name="group.group"
            :group-icon="group.icon"
            :items="group.items"
            :mode="menuMode"
            :default-expanded="expandedGroups.includes(group.group)"
          />
        </nav>

        <div class="sidebar-footer">
          <button class="btn-profile" @click="profile">
            <i class="fas fa-user-alt"></i>
            <span>Perfil</span>
          </button>
          <button class="btn-logout" @click="logout">
            <i class="fas fa-sign-in-alt"></i>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>

    <!-- Botón para abrir sidebar cuando está cerrado -->
    <button
      v-if="menuMode === 'lateral' && !sidebarVisible"
      class="btn-open-sidebar"
      @click="toggleSidebar"
      title="Abrir menú"
    >
      <i class="fas fa-bars"></i>
    </button>

    <!-- Toggle de modo en menú lateral -->
    <button
      v-if="menuMode === 'lateral'"
      class="btn-toggle-mode-fixed"
      @click="toggleMenuMode"
      title="Cambiar a menú superior"
    >
      <i class="fas fa-window-maximize"></i>
    </button>
  </div>
</template>

<script>
import LinkNavigation from "../LinkNavigation";
import NavigationGroup from "./NavigationGroup";
import OptionsModal from "../modals/OptionsModal";

export default {
  components: {
    LinkNavigation,
    NavigationGroup,
    OptionsModal,
  },
  data() {
    return {
      showModal: false,
      menuMode: "horizontal",
      sidebarVisible: false,
      expandedGroups: [],
      menuItems: [
        {
          group: "Casos",
          icon: "fas fa-folder-open",
          items: [
            {
              to: "/administratorsPages/findCase",
              icon: "fas fa-search",
              title: "Búsqueda de casos",
            },
            {
              to: "/administratorsPages/reviewNewQuestions",
              icon: "fas fa-folder",
              title: "Revisión de casos",
            },
            {
              to: "/administratorsPages/requestedCases",
              icon: "fas fa-list-alt",
              title: "Solicitud de casos",
            },
          ],
        },
        {
          group: "Análisis",
          icon: "fas fa-chart-line",
          items: [
            {
              to: "/administratorsPages/statistics",
              icon: "fas fa-chart-bar",
              title: "Análisis de banco",
            },
            {
              to: "/administratorsPages/reports",
              icon: "fas fa-exclamation-circle",
              title: "Reportes",
            },
          ],
        },
        {
          group: "Contenido",
          icon: "fas fa-file-alt",
          items: [
            {
              to: "/administratorsPages/simulators",
              icon: "fas fa-book-open",
              title: "Simuladores",
            },
            {
              to: "/administratorsPages/infographics",
              icon: "fas fa-file-image",
              title: "Infográficos",
            },
          ],
        },
        {
          group: "Usuarios",
          icon: "fas fa-users",
          items: [
            {
              to: "/administratorsPages/spotlighters",
              icon: "fas fa-user-friends",
              title: "Spotlighters",
            },
            {
              to: "/administratorsPages/administrators",
              icon: "fas fa-user-shield",
              title: "Administradores",
            },
          ],
        },
      ],
    };
  },
  mounted() {
    if (process.browser) {
      // Cargar preferencias guardadas
      const savedMode = localStorage.getItem("navigation_mode");
      const savedSidebarVisible = localStorage.getItem("sidebar_visible");

      if (savedMode && ["horizontal", "lateral"].includes(savedMode)) {
        this.menuMode = savedMode;
      }

      if (savedSidebarVisible !== null) {
        this.sidebarVisible = savedSidebarVisible === "true";
      } else if (this.menuMode === "lateral") {
        // Por defecto, sidebar visible en desktop, oculto en móvil
        this.sidebarVisible = window.innerWidth >= 768;
      }

      // Auto-expandir grupos que contengan la ruta actual
      this.autoExpandActiveGroups();

      // Listener para responsive
      window.addEventListener("resize", this.handleResize);
      this.handleResize();
    }
  },
  beforeDestroy() {
    if (process.browser) {
      window.removeEventListener("resize", this.handleResize);
    }
  },
  methods: {
    toggleMenuMode() {
      this.menuMode = this.menuMode === "horizontal" ? "lateral" : "horizontal";

      if (this.menuMode === "lateral") {
        // Al cambiar a lateral, mostrar sidebar en desktop
        this.sidebarVisible = window.innerWidth >= 768;
      }

      this.savePreferences();
    },
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
      this.savePreferences();
    },
    autoExpandActiveGroups() {
      if (!process.browser) return;
      const currentPath = this.$route.path;

      this.menuItems.forEach((group) => {
        const hasActive = group.items.some((item) => {
          if (item.to === currentPath) return true;
          return (
            currentPath.startsWith(item.to) &&
            item.to !== "/administratorsPages"
          );
        });

        if (hasActive && !this.expandedGroups.includes(group.group)) {
          this.expandedGroups.push(group.group);
        }
      });
    },
    savePreferences() {
      if (process.browser) {
        localStorage.setItem("navigation_mode", this.menuMode);
        localStorage.setItem("sidebar_visible", this.sidebarVisible.toString());
        // Disparar evento personalizado para notificar cambios
        window.dispatchEvent(new Event("navigation-changed"));
      }
    },
    handleResize() {
      if (!process.browser) return;

      // En móviles, ocultar sidebar automáticamente si está abierto
      if (window.innerWidth < 768 && this.sidebarVisible) {
        this.sidebarVisible = false;
      }
    },
    profile() {
      if (process.browser) {
        this.userData = JSON.parse(localStorage.getItem("user"));
      }
      if (this.userData.role == "Administrador") {
        this.$router.push({ path: "/administratorsPages/profile" });
      } else {
        this.$router.push({ path: "/spotlightersPages/profile" });
      }
    },
    logout() {
      setTimeout(() => {
        this.$router.push({ path: "/" });
        this.$store.dispatch("killSession");
        localStorage.clear();
      }, 1000);
    },
  },
};
</script>

<style scoped>
/* ===== HEADER HORIZONTAL ===== */
.head-navigation {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #d4d5d7;
  position: relative;
  z-index: 1000;
}

.head-navigation img {
  width: 220.11px;
  height: 28px;
  margin-left: 40px;
  flex-shrink: 0;
}

.nav {
  display: flex;
  align-items: center;
}

.nav-horizontal {
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 0 20px;
  flex-wrap: nowrap;
}

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
  margin-right: 3%;
}

.btn-toggle-mode {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: #5f5f5f;
  font-size: 18px;
}

.btn-toggle-mode:hover {
  background-color: #e9f6ff;
  color: #1ca4fc;
}

.profile {
  margin-left: 0;
}

.profile i {
  font-size: 36px;
}

.show div {
  transform: translate3d(-130px, 50px, 0px) !important;
}

.dropdown-menu {
  font-family: Montserrat;
  width: 175px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 0px 20px #d4d5d7;
}

.dropdown-menu i {
  font-size: 18px;
}

/* ===== SIDEBAR LATERAL ===== */
.sidebar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 2000;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #d4d5d7;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2000;
  overflow-y: auto;
}

.sidebar.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #d4d5d7;
  height: 60px;
}

.sidebar-logo {
  width: 180px;
  height: auto;
}

.btn-close-sidebar {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #5f5f5f;
  font-size: 20px;
  transition: all 0.2s ease;
}

.btn-close-sidebar:hover {
  background-color: #e9f6ff;
  color: #1ca4fc;
}

.nav-lateral {
  flex: 1;
  flex-direction: column;
  padding: 16px 0;
  overflow-y: auto;
  width: 100%;
  display: flex;
}

.nav-lateral > * {
  width: 100%;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #d4d5d7;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-profile,
.btn-logout {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: Montserrat;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: left;
}

.btn-profile {
  background-color: #e9f6ff;
  color: #1ca4fc;
}

.btn-profile:hover {
  background-color: #d4e8f5;
}

.btn-logout {
  background-color: transparent;
  color: #db1212;
}

.btn-logout:hover {
  background-color: #fee;
}

.btn-profile i,
.btn-logout i {
  font-size: 16px;
}

/* ===== BOTONES FLOTANTES ===== */
.btn-open-sidebar {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 48px;
  height: 48px;
  background: #fff;
  border: 1px solid #d4d5d7;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1500;
  transition: all 0.3s ease;
  color: #5f5f5f;
  font-size: 20px;
  animation: slideInLeft 0.3s ease;
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.btn-open-sidebar:hover {
  background-color: #e9f6ff;
  color: #1ca4fc;
  transform: scale(1.05);
}

.btn-toggle-mode-fixed {
  position: fixed;
  top: 80px;
  left: 20px;
  width: 48px;
  height: 48px;
  background: #fff;
  border: 1px solid #d4d5d7;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1500;
  transition: all 0.3s ease;
  color: #5f5f5f;
  font-size: 18px;
  animation: slideInLeft 0.4s ease;
}

.btn-toggle-mode-fixed:hover {
  background-color: #e9f6ff;
  color: #1ca4fc;
  transform: scale(1.05);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .head-navigation img {
    width: 160px;
    margin-left: 20px;
  }

  .nav-horizontal {
    padding: 0 10px;
    gap: 4px;
  }

  .sidebar {
    width: 100%;
    max-width: 320px;
  }
}

/* ===== UTILIDADES ===== */
.options {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  background: red;
}
</style>

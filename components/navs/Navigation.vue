<template>
  <div>
    <!-- Menú Lateral -->
    <div
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
      <aside
        class="sidebar"
        :class="{
          'sidebar-open': sidebarVisible,
          'sidebar-collapsed': isCollapsed && !isHovered && !isPinned,
          'sidebar-expanded': !isCollapsed || isHovered || isPinned,
          'sidebar-pinned': isPinned
        }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="sidebar-header">
          <img
            v-if="!isCollapsed || isHovered || isPinned"
            src="../../assets/images/logo.svg"
            alt=""
            class="sidebar-logo"
          />
          <button
            class="btn-toggle-sidebar"
            @click="togglePin"
            :title="isPinned ? 'Desfijar menú' : 'Fijar menú abierto'"
            :class="{ 'pinned': isPinned }"
          >
            <i :class="isPinned ? 'fas fa-thumbtack' : 'fas fa-thumbtack'"></i>
          </button>
        </div>

        <nav class="nav nav-lateral">
          <NavigationGroup
            v-for="group in menuItems"
            :key="group.group"
            :group-name="group.group"
            :group-icon="group.icon"
            :items="group.items"
            :default-expanded="expandedGroups.includes(group.group)"
            :is-collapsed="isCollapsed && !isHovered && !isPinned"
          />
        </nav>

        <div class="sidebar-footer">
          <button class="btn-profile" @click="profile">
            <i class="fas fa-user-alt"></i>
            <span v-if="!isCollapsed || isHovered || isPinned">Perfil</span>
          </button>
          <button class="btn-logout" @click="logout">
            <i class="fas fa-sign-in-alt"></i>
            <span v-if="!isCollapsed || isHovered || isPinned">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </div>

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
      sidebarVisible: true, // Siempre visible, pero puede estar comprimido
      isCollapsed: true, // Por defecto comprimido
      isPinned: false, // Si está fijado abierto
      isHovered: false, // Para hover temporal
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
      const savedIsPinned = localStorage.getItem("sidebar_pinned");
      const savedIsCollapsed = localStorage.getItem("sidebar_collapsed");

      if (savedIsPinned !== null) {
        this.isPinned = savedIsPinned === "true";
      }

      if (savedIsCollapsed !== null) {
        this.isCollapsed = savedIsCollapsed === "true";
      } else {
        // Por defecto comprimido
        this.isCollapsed = true;
      }

      // Sidebar siempre visible en desktop (comprimido por defecto)
      this.sidebarVisible = window.innerWidth >= 768;

      // Auto-expandir grupos que contengan la ruta actual
      this.autoExpandActiveGroups();

      // Listener para responsive
      window.addEventListener("resize", this.handleResize);
      this.handleResize();

      // Notificar estado inicial después de cargar preferencias
      this.$nextTick(() => {
        this.notifySidebarState();
      });
    }
  },
  beforeDestroy() {
    if (process.browser) {
      window.removeEventListener("resize", this.handleResize);
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible;
      this.savePreferences();
    },
    togglePin() {
      this.isPinned = !this.isPinned;
      if (this.isPinned) {
        this.isCollapsed = false;
        this.isHovered = false;
      }
      this.savePreferences();
      this.notifySidebarState();
    },
    handleMouseEnter() {
      if (!this.isPinned && this.isCollapsed) {
        this.isHovered = true;
        this.notifySidebarState();
      }
    },
    handleMouseLeave() {
      if (!this.isPinned && this.isCollapsed) {
        this.isHovered = false;
        this.notifySidebarState();
      }
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
        localStorage.setItem("sidebar_visible", this.sidebarVisible.toString());
        localStorage.setItem("sidebar_pinned", this.isPinned.toString());
        localStorage.setItem("sidebar_collapsed", this.isCollapsed.toString());
        // Disparar evento personalizado para notificar cambios
        window.dispatchEvent(new Event("navigation-changed"));
      }
    },
    notifySidebarState() {
      if (process.browser) {
        // Disparar evento para notificar al layout
        window.dispatchEvent(new CustomEvent("sidebar-state-changed", {
          detail: {
            isPinned: this.isPinned,
            isCollapsed: this.isCollapsed && !this.isHovered && !this.isPinned
          }
        }));
      }
    },
    handleResize() {
      if (!process.browser) return;

      // En móviles, ocultar sidebar automáticamente
      if (window.innerWidth < 768) {
        this.sidebarVisible = false;
      } else {
        this.sidebarVisible = true;
      }
      this.notifySidebarState();
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
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2000;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.sidebar-open {
  transform: translateX(0);
}

/* Sidebar comprimido */
.sidebar.sidebar-collapsed {
  width: 70px;
}

/* Sidebar expandido (hover o pinned) */
.sidebar.sidebar-expanded {
  width: 280px;
}

/* Cuando está fijado, z-index normal para empujar contenido */
.sidebar.sidebar-pinned {
  z-index: 1000;
}

/* Cuando está en hover (no fijado), z-index alto para estar sobre contenido */
.sidebar.sidebar-expanded:not(.sidebar-pinned) {
  z-index: 2000;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #d4d5d7;
  height: 60px;
  min-height: 60px;
  flex-shrink: 0;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-collapsed .sidebar-header {
  padding: 20px 12px;
  justify-content: center;
}

.sidebar-logo {
  width: 180px;
  height: auto;
  transition: opacity 0.2s ease;
  opacity: 1;
}

.sidebar-collapsed .sidebar-logo {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

.btn-toggle-sidebar {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #5f5f5f;
  font-size: 18px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-toggle-sidebar:hover {
  background-color: #e9f6ff;
  color: #1ca4fc;
}

.sidebar-collapsed .btn-toggle-sidebar {
  margin: 0 auto;
}

.btn-toggle-sidebar.pinned {
  color: #1ca4fc;
}

.btn-toggle-sidebar.pinned i {
  transform: rotate(45deg);
  transition: transform 0.2s ease;
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
  flex-shrink: 0;
  transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-collapsed .sidebar-footer {
  padding: 16px 8px;
  align-items: center;
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
  justify-content: flex-start;
  white-space: nowrap;
}

.sidebar-collapsed .btn-profile,
.sidebar-collapsed .btn-logout {
  justify-content: center;
  padding: 12px;
  min-width: 48px;
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

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
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

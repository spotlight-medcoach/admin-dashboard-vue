<template>
  <div>
    <!-- Menú Lateral -->
    <div v-if="shouldShowSidebar" class="sidebar-wrapper">
      <!-- Sidebar -->
      <aside
        class="sidebar"
        :class="{
          'sidebar-open': sidebarVisible,
          'sidebar-collapsed': isCollapsed && !isHovered && !isPinned,
          'sidebar-expanded': !isCollapsed || isHovered || isPinned,
          'sidebar-pinned': isPinned,
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
          <div class="sidebar-icon" @click="togglePin">
            <img
              src="../../assets/images/icon.png"
              alt=""
              width="100%"
              height="100%"
              object-fit="contain"
              class="sidebar-icon-image"
            />
          </div>
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
            <span v-if="!isCollapsed || isHovered || isPinned"
              >Cerrar sesión</span
            >
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script>
import LinkNavigation from '../LinkNavigation';
import NavigationGroup from './NavigationGroup';
import OptionsModal from '../modals/OptionsModal';

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
      windowWidth: 0,
      menuItems: [
        {
          group: 'Casos',
          icon: 'fas fa-folder-open',
          items: [
            {
              to: '/administratorsPages/findCase',
              icon: 'fas fa-search',
              title: 'Búsqueda de casos',
            },
            {
              to: '/administratorsPages/reviewNewQuestions',
              icon: 'fas fa-folder',
              title: 'Revisión de casos',
            },
            {
              to: '/administratorsPages/requestedCases',
              icon: 'fas fa-list-alt',
              title: 'Solicitud de casos',
            },
          ],
        },
        {
          group: 'Análisis',
          icon: 'fas fa-chart-line',
          items: [
            {
              to: '/administratorsPages/statistics',
              icon: 'fas fa-chart-bar',
              title: 'Análisis de banco',
            },
            {
              to: '/administratorsPages/reports',
              icon: 'fas fa-exclamation-circle',
              title: 'Reportes',
            },
          ],
        },
        {
          group: 'Contenido',
          icon: 'fas fa-file-alt',
          items: [
            {
              to: '/administratorsPages/simulators',
              icon: 'fas fa-book-open',
              title: 'Simuladores',
            },
            {
              to: '/administratorsPages/infographics',
              icon: 'fas fa-file-image',
              title: 'Infográficos',
            },
            {
              to: '/administratorsPages/manuals',
              icon: 'fas fa-book',
              title: 'Manuales',
            },
          ],
        },
        {
          group: 'Usuarios',
          icon: 'fas fa-users',
          items: [
            {
              to: '/administratorsPages/spotlighters',
              icon: 'fas fa-user-friends',
              title: 'Spotlighters',
            },
            {
              to: '/administratorsPages/administrators',
              icon: 'fas fa-user-shield',
              title: 'Administradores',
            },
          ],
        },
      ],
    };
  },
  computed: {
    shouldShowSidebar() {
      // En SSR, siempre mostrar (se ajustará en el cliente)
      if (!process.browser) return true;
      // Si windowWidth aún no se ha inicializado, asumir desktop
      if (this.windowWidth === 0) {
        return typeof window !== 'undefined' && window.innerWidth >= 768
          ? true
          : this.sidebarVisible;
      }
      // En desktop siempre visible, en móvil solo si sidebarVisible es true
      return this.windowWidth >= 768 ? true : this.sidebarVisible;
    },
  },
  mounted() {
    if (process.browser) {
      try {
        // Cargar preferencias guardadas
        const savedIsPinned = localStorage.getItem('sidebar_pinned');
        const savedIsCollapsed = localStorage.getItem('sidebar_collapsed');
        const savedSidebarVisible = localStorage.getItem('sidebar_visible');

        // Cargar estado del sidebar visible
        if (savedSidebarVisible !== null) {
          this.sidebarVisible = savedSidebarVisible === 'true';
        } else {
          // Por defecto, visible en desktop
          this.sidebarVisible = window.innerWidth >= 768;
        }

        // Cargar estado pinned
        if (savedIsPinned !== null) {
          this.isPinned = savedIsPinned === 'true';
        }

        // Cargar estado collapsed
        if (savedIsCollapsed !== null) {
          this.isCollapsed = savedIsCollapsed === 'true';
        } else {
          // Por defecto comprimido
          this.isCollapsed = true;
        }

        // Asegurar que en desktop siempre esté visible
        if (window.innerWidth >= 768) {
          this.sidebarVisible = true;
        }

        // Auto-expandir grupos que contengan la ruta actual
        this.autoExpandActiveGroups();

        // Listener para responsive
        this.windowWidth = window.innerWidth;
        window.addEventListener('resize', this.handleResize);
        this.handleResize();

        // Guardar estado inicial si no existía
        this.savePreferences();

        // Notificar estado inicial después de cargar preferencias
        this.$nextTick(() => {
          this.notifySidebarState();
        });
      } catch (error) {
        console.error('Error al cargar estado del sidebar:', error);
        // En caso de error, asegurar que el sidebar esté visible en desktop
        if (window.innerWidth >= 768) {
          this.sidebarVisible = true;
        }
      }
    }
  },
  beforeDestroy() {
    if (process.browser) {
      window.removeEventListener('resize', this.handleResize);
    }
  },
  methods: {
    toggleSidebar() {
      // Solo para móviles - ocultar/mostrar completamente
      if (window.innerWidth < 768) {
        this.sidebarVisible = !this.sidebarVisible;
        this.savePreferences();
      }
    },
    togglePin() {
      this.isPinned = !this.isPinned;
      if (this.isPinned) {
        this.isCollapsed = false;
        this.isHovered = false;
      } else {
        // Al desactivar el pin, comprimir pero mantener visible
        this.isCollapsed = true;
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
            item.to !== '/administratorsPages'
          );
        });

        if (hasActive && !this.expandedGroups.includes(group.group)) {
          this.expandedGroups.push(group.group);
        }
      });
    },
    savePreferences() {
      if (process.browser) {
        localStorage.setItem('sidebar_visible', this.sidebarVisible.toString());
        localStorage.setItem('sidebar_pinned', this.isPinned.toString());
        localStorage.setItem('sidebar_collapsed', this.isCollapsed.toString());
        // Disparar evento personalizado para notificar cambios
        window.dispatchEvent(new Event('navigation-changed'));
      }
    },
    notifySidebarState() {
      if (process.browser) {
        // Disparar evento para notificar al layout
        window.dispatchEvent(
          new CustomEvent('sidebar-state-changed', {
            detail: {
              isPinned: this.isPinned,
              isCollapsed:
                this.isCollapsed && !this.isHovered && !this.isPinned,
            },
          })
        );
      }
    },
    handleResize() {
      if (!process.browser) return;

      this.windowWidth = window.innerWidth;

      // En móviles, ocultar sidebar automáticamente
      if (window.innerWidth < 768) {
        this.sidebarVisible = false;
      } else {
        // En desktop, siempre visible (puede estar comprimido)
        this.sidebarVisible = true;
      }
      this.notifySidebarState();
    },
    profile() {
      if (process.browser) {
        this.userData = JSON.parse(localStorage.getItem('user'));
      }
      if (this.userData.role == 'Administrador') {
        this.$router.push({ path: '/administratorsPages/profile' });
      } else {
        this.$router.push({ path: '/spotlightersPages/profile' });
      }
    },
    logout() {
      setTimeout(() => {
        this.$router.push({ path: '/' });
        this.$store.dispatch('killSession');
        localStorage.clear();
      }, 1000);
    },
  },
};
</script>

<style scoped>
/* ===== VARIABLES DE ANIMACIÓN ===== */
/*
 * ⚠️⚠️⚠️ CAMBIAR AQUÍ LA VELOCIDAD DE TODAS LAS ANIMACIONES DEL SIDEBAR ⚠️⚠️⚠️
 *
 * Modifica estos dos valores para ajustar la velocidad de apertura/cierre:
 *
 * 1. DURACIÓN (--sidebar-transition-duration):
 *    - 0.3s = rápido
 *    - 0.5s = medio (actual)
 *    - 0.8s = lento
 *    - 1.0s = muy lento
 *
 * 2. TIMING (--sidebar-transition-timing):
 *    - cubic-bezier(0.4, 0, 0.2, 1) = suave (actual)
 *    - cubic-bezier(0.25, 0.1, 0.25, 1) = más suave
 *    - ease-in-out = estándar
 *
 * Estos valores se aplican a:
 * - Apertura/cierre del sidebar
 * - Mostrar/ocultar texto de menús
 * - Transiciones de padding y márgenes
 * - Animaciones de iconos y títulos
 */
.sidebar {
  --sidebar-transition-duration: 0.5s;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== SIDEBAR LATERAL ===== */
.sidebar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 2000;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  /* Efecto glass (glassmorphism) - más transparente */
  background: transparent;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border-right: 1px solid rgba(212, 213, 215, 0.15);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transform: translateX(0);
  /* Usar variable CSS para la velocidad - definida arriba en .sidebar */
  transition: width var(--sidebar-transition-duration, 0.5s)
    var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  z-index: 2000;
  overflow-y: auto;
  overflow-x: hidden;
  /* Bordes redondeados en superior derecho e inferior derecho */
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
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
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 20px 8px 20px 16px;
  border-bottom: 1px solid rgba(212, 213, 215, 0.3);
  height: 60px;
  min-height: 60px;
  flex-shrink: 0;
  /* Fondo traslúcido para mantener el efecto glass */
  background: transparent;
  /* Usar variable CSS para la velocidad - definida en .sidebar */
  transition: padding var(--sidebar-transition-duration, 0.5s)
    var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  /* Bordes redondeados en la parte superior */
  border-top-right-radius: 20px;
  overflow: hidden;
}

.sidebar-collapsed .sidebar-header {
  padding: 20px 12px;
  justify-content: center;
}

.sidebar-logo {
  width: 180px;
  height: auto;
  /* Usar variable CSS para la velocidad - definida en .sidebar */
  transition: opacity var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    width var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  opacity: 1;
  overflow: hidden;
}

.sidebar-collapsed .sidebar-logo {
  opacity: 0;
  width: 0;
}

.sidebar-icon-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  transition: opacity 0.2s ease;
  opacity: 1;
}

.sidebar-icon {
  width: 48px;
  height: 48px;
  transition: opacity 0.2s ease;
  opacity: 1;
  cursor: pointer;
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
  background-color: rgba(233, 246, 255, 0.6);
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
  padding: 16px 8px;
  overflow-y: auto;
  width: 100%;
  display: flex;
}

.nav-lateral > * {
  width: 100%;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(212, 213, 215, 0.3);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  /* Fondo traslúcido para mantener el efecto glass */
  background: transparent;
  /* Usar variable CSS para la velocidad - definida en .sidebar */
  transition: padding var(--sidebar-transition-duration, 0.5s)
    var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  /* Bordes redondeados en la parte inferior */
  border-bottom-right-radius: 20px;
  overflow: hidden;
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
  position: relative;
  overflow: hidden;
}

.sidebar-collapsed .btn-profile,
.sidebar-collapsed .btn-logout {
  justify-content: center;
  padding: 12px;
  min-width: 48px;
}

/* Ocultar texto detrás del contenedor cuando se colapsa */
.btn-profile span,
.btn-logout span {
  /* Usar variable CSS para la velocidad - definida en .sidebar */
  transition: opacity var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    width var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    margin var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  overflow: hidden;
  white-space: nowrap;
}

.sidebar-collapsed .btn-profile span,
.sidebar-collapsed .btn-logout span {
  width: 0;
  opacity: 0;
  margin: 0;
}

.btn-profile {
  background-color: rgba(233, 246, 255, 0.6);
  color: #1ca4fc;
}

.btn-profile:hover {
  background-color: rgba(212, 232, 245, 0.7);
}

.btn-logout {
  background-color: transparent;
  color: #db1212;
}

.btn-logout:hover {
  background-color: rgba(255, 238, 238, 0.6);
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
    transform: translateX(-100%);
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
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

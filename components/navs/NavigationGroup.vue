<template>
  <div
    class="navigation-group"
    :class="{
      expanded: isExpanded,
      'is-collapsed': isCollapsed,
    }"
  >
    <div
      class="group-header"
      @click="toggleExpand"
      :class="{ 'has-active': hasActiveChild }"
    >
      <i :class="groupIcon" class="group-icon"></i>
      <span class="group-title" v-if="!isCollapsed">{{ groupName }}</span>
      <i
        v-if="!isCollapsed"
        class="fas fa-chevron-down expand-icon"
        :class="{ rotated: isExpanded }"
      ></i>
    </div>

    <!-- Submenú lateral -->
    <transition name="submenu">
      <div v-show="isExpanded && !isCollapsed" class="submenu-items lateral">
        <LinkNavigation
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :new_class="'link nuxt-link-active'"
          :icon="item.icon"
          :title="item.title"
          :is-collapsed="isCollapsed"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import LinkNavigation from '../LinkNavigation';

export default {
  components: {
    LinkNavigation,
  },
  props: {
    groupName: {
      type: String,
      required: true,
    },
    groupIcon: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    defaultExpanded: {
      type: Boolean,
      default: false,
    },
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isExpanded: this.defaultExpanded,
    };
  },
  computed: {
    hasActiveChild() {
      if (!process.browser) return false;
      const currentPath = this.$route.path;
      return this.items.some((item) => {
        if (item.to === currentPath) return true;
        // También verificar si la ruta actual empieza con la ruta del item
        return (
          currentPath.startsWith(item.to) && item.to !== '/administratorsPages'
        );
      });
    },
  },
  methods: {
    toggleExpand() {
      // No expandir si está comprimido
      if (this.isCollapsed) {
        return;
      }
      this.isExpanded = !this.isExpanded;
    },
  },
};
</script>

<style scoped>
/* 
 * ⚠️ VARIABLES DE VELOCIDAD ⚠️
 * Las variables se definen en Navigation.vue (líneas 342-344)
 * Para cambiar la velocidad, modifica esos valores en Navigation.vue
 * Los valores por defecto aquí son: 0.5s y cubic-bezier(0.4, 0, 0.2, 1)
 */
.navigation-group {
  position: relative;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  /* Usar variable CSS para la velocidad */
  transition: all var(--sidebar-transition-duration, 0.5s)
    var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  --sidebar-transition-duration: 0.5s;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  position: relative;
  overflow: hidden;
}

.group-header:hover {
  background-color: rgba(233, 246, 255, 0.6);
}

.group-header.has-active {
  background-color: rgba(233, 246, 255, 0.6);
  color: #1ca4fc;
}

/* Ocupar todo el ancho */
.group-header {
  justify-content: flex-start;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 4px;
  box-sizing: border-box;
  /* Usar variable CSS para la velocidad */
  transition: padding var(--sidebar-transition-duration, 0.5s)
    var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  --sidebar-transition-duration: 0.5s;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
}

.navigation-group.is-collapsed .group-header {
  justify-content: center;
  padding: 12px;
}

.navigation-group {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.group-icon {
  font-size: 18px;
  color: #5f5f5f;
  /* Usar variable CSS para la velocidad */
  transition: color var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    margin var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  --sidebar-transition-duration: 0.5s;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: 12px;
  flex-shrink: 0;
}

.navigation-group.is-collapsed .group-icon {
  margin-right: 0;
}

.group-header.has-active .group-icon {
  color: #1ca4fc;
}

.group-title {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  color: #212529;
  /* Usar variable CSS para la velocidad - ocultar texto detrás del contenedor */
  transition: opacity var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    width var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    margin var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  --sidebar-transition-duration: 0.5s;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  margin-left: 0;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
}

.navigation-group.is-collapsed .group-title {
  width: 0;
  opacity: 0;
  margin: 0;
  overflow: hidden;
}

.group-header.has-active .group-title {
  color: #1ca4fc;
}

.expand-icon {
  font-size: 12px;
  color: #5f5f5f;
  /* Usar variable CSS para la velocidad */
  transition: transform var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    color var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1)),
    opacity var(--sidebar-transition-duration, 0.5s)
      var(--sidebar-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));
  --sidebar-transition-duration: 0.5s;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
  flex-shrink: 0;
}

.navigation-group.is-collapsed .expand-icon {
  opacity: 0;
  width: 0;
  margin: 0;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.group-header.has-active .expand-icon {
  color: #1ca4fc;
}

/* Submenú lateral - ocupar todo el ancho */
.submenu-items.lateral {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0;
  margin-top: 4px;
  padding-left: 0;
}

.submenu-items.lateral .link-container {
  width: 100%;
  margin-left: 0;
  margin-right: 0;
}

/* Animaciones para submenú lateral */
.submenu-enter-active,
.submenu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-enter,
.submenu-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.submenu-enter-to,
.submenu-leave {
  transform: translateY(0);
  opacity: 1;
}
</style>

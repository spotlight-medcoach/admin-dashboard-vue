<template>
  <aside class="cs-sidebar">
    <p class="cs-sidebar__heading">Configuración general</p>
    <nav>
      <nuxt-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="cs-sidebar__item"
        active-class="cs-sidebar__item--active"
      >
        <i :class="['cs-sidebar__icon', item.icon]"></i>
        <span>{{ item.label }}</span>
      </nuxt-link>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'ConfigSidebar',
  data () {
    return {
      items: [
        {
          to: '/configuracion/widget',
          icon: 'fas fa-bug',
          label: 'Widget de reportes',
        },
      ],
    }
  },
}
</script>

<style scoped>
.cs-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #e9ecef;
  padding: 8px 0;
  min-height: calc(100vh - 120px);
}

.cs-sidebar__heading {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #adb5bd;
  padding: 8px 20px 12px;
  margin: 0;
}

.cs-sidebar__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  font-size: 14px;
  color: #495057;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}

.cs-sidebar__item:hover {
  background: #f8f9fa;
  color: #212529;
  text-decoration: none;
}

.cs-sidebar__item--active {
  background: #f0f0ff;
  color: #4040c8;
  border-left-color: #4040c8;
  font-weight: 600;
}

.cs-sidebar__icon {
  width: 16px;
  text-align: center;
  font-size: 14px;
  color: inherit;
}
</style>

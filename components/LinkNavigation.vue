<template>
  <div
    class="link-container"
    :class="{
      'mode-horizontal': mode === 'horizontal',
      'mode-lateral': mode === 'lateral',
    }"
  >
    <NuxtLink :to="to" :class="new_class"> <i :class="icon"></i></NuxtLink>
    <p v-if="mode === 'lateral'" class="link-title">{{ title }}</p>
    <p v-else class="link-title-hover">{{ title }}</p>
  </div>
</template>

<script>
export default {
  props: {
    to: String,
    new_class: String,
    icon: String,
    title: String,
    mode: {
      type: String,
      default: "horizontal",
      validator: (value) => ["horizontal", "lateral"].includes(value),
    },
  },
};
</script>

<style scoped>
.link-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s ease;
}

.link-container.mode-lateral {
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
  box-sizing: border-box;
}

.link-container.mode-horizontal {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 0;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}

.link-container.mode-horizontal:hover {
  background-color: #e9f6ff;
}

.link-container.mode-horizontal .link-title-hover {
  display: block;
  margin-left: 12px;
  font-size: 14px;
  text-align: left;
  flex: 1;
}

.link-container.mode-lateral:hover {
  background-color: #e9f6ff;
}

.link-title,
.link-title-hover {
  margin: 0;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  color: #212529;
  text-align: center;
  transition: all 0.2s ease;
}

.link-title {
  margin-left: 12px;
  font-size: 14px;
  text-align: left;
  flex: 1;
}

.link-container.mode-horizontal:not(:hover) .link-title-hover {
  display: none;
}

.link-container.mode-lateral .link-title {
  display: block;
}

a:hover {
  color: #fff;
  background-color: #ff9300;
  border-color: #afc7dd;
}

.link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #ffffff;
  background: #5f5f5f;
  border-radius: 50%;
  border: 1px solid #5f5f5f;
  text-decoration: none;
  transition: all 0.2s ease;
}

.link-container.mode-lateral .link {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.nuxt-link-exact-active {
  color: #fff;
  background-color: #ff9300;
  border-color: #ff9300;
}

.link-container.mode-lateral .nuxt-link-exact-active + .link-title {
  color: #ff9300;
  font-weight: 600;
}
</style>

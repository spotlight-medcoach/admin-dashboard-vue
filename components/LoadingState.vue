<template>
<div class="d-flex align-items-center justify-content-center" :style="{'height': height}">
  <div>
    <div class="mt-5 d-flex justify-content-around text-center" style="font-size: 28px;">
      {{ message }}
    </div>
    <div class="mt-5 d-flex justify-content-around">
      <img src="@/assets/icons/loading.svg" width="100" />
    </div>
  </div>
</div>
</template>
<script>
export default {
  name: 'loading-state',
  props: {
    message: {
      type: String,
      default: 'Espere un momento por favor'
    },
    height: {
      type: String,
      default: '80vh'
    }
  }
}
</script>

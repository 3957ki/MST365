<template>
  <div class="min-h-screen bg-white">
    <router-view />
  </div>
</template>

<script>
// HelloWorld is now rendered via router-view, so it's not directly needed here
// unless App.vue itself needs it for other purposes.
// For now, we can remove it from components if it's only for routing.
export default {
  name: 'App',
  components: {
    // HelloWorld // Removed as it's handled by router
  }
}
</script>

<style>
/* Global styles are now in src/style.css */
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNavigation from '@/components/BottomNavigation.vue'

const route = useRoute()
const showBottomNavigation = computed(() => !route.meta.hideBottomNav)
</script>

<template>
  <main class="app-shell" :class="{ 'app-shell--with-nav': showBottomNavigation }">
    <RouterView />
  </main>
  <BottomNavigation v-if="showBottomNavigation" />
</template>

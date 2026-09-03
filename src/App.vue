<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AppShell, AppHeader, AppFooter, ResponsiveSearch } from './remotes'

const router = useRouter()
const headerQuery = ref('')

function goSearch() {
  const q = headerQuery.value.trim()
  void router.push({ path: '/search', query: q ? { q } : {} })
}
</script>

<template>
  <AppShell>
    <template #header>
      <AppHeader>
        <ResponsiveSearch
          v-model="headerQuery"
          @submit="goSearch"
          @mobile-search="router.push('/search')"
        />
      </AppHeader>
    </template>

    <RouterView />

    <template #footer>
      <AppFooter />
    </template>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AppShell, AppHeader, AppFooter, ResponsiveSearch } from './remotes'
import { queryFromRoute } from './searchQuery'

const router = useRouter()
const route = useRoute()

const headerQuery = ref(queryFromRoute(route.query.q))

watch(
  () => [route.path, route.query.q] as const,
  () => {
    if (route.path !== '/search') return
    const next = queryFromRoute(route.query.q)
    if (next !== headerQuery.value) headerQuery.value = next
  },
)

watch(headerQuery, (value) => {
  if (route.path !== '/search') return
  const next = value.trim()
  const current = queryFromRoute(route.query.q)
  if (next === current) return
  void router.replace({ path: '/search', query: next ? { q: next } : {} })
})

function goSearch() {
  const q = headerQuery.value.trim()
  void router.push({ path: '/search', query: q ? { q } : {} })
}
</script>

<template>
  <AppShell>
    <template #header>
      <AppHeader>
        <ResponsiveSearch v-model="headerQuery" @submit="goSearch" />
      </AppHeader>
    </template>

    <RouterView />

    <template #footer>
      <AppFooter />
    </template>
  </AppShell>
</template>

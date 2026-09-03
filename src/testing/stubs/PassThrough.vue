<script setup lang="ts">
/**
 * Stands in for a federated tvmaze-ui layout component during host unit tests,
 * rendering the default slot plus the named slots AppShell provides.
 */
</script>

<template>
  <div>
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </div>
</template>

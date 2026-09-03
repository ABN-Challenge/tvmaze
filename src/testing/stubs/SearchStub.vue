<script setup lang="ts">
defineProps<{ modelValue: string }>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()
</script>

<template>
  <form data-testid="search-stub" @submit.prevent="emit('submit')">
    <input
      :value="modelValue"
      data-testid="search-stub-input"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </form>
</template>

<template>
  <div class="error-state">
    <p>{{ message }}</p>
    <button type="button" class="retry-btn" @click="$emit('retry')">重试</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-state {
  border: 1px solid color-mix(in srgb, var(--danger) 35%, white);
  background: color-mix(in srgb, var(--danger) 8%, white);
  color: var(--danger);
  border-radius: 12px;
  padding: 14px;
}

.retry-btn {
  margin-top: 8px;
  border: 0;
  background: var(--danger);
  color: #fff;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
}
</style>

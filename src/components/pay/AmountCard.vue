<template>
  <article class="amount-card">
    <p class="merchant">{{ merchant }}</p>
    <p class="amount">¥ {{ amount.toFixed(2) }}</p>
    <p class="desc">{{ description }}</p>
  </article>
</template>

<script setup lang="ts">
defineProps<{
  merchant: string
  amount: number
  description: string
}>()
</script>

<style scoped>
.amount-card {
  border-radius: 16px;
  padding: 16px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
}

.merchant {
  margin: 0;
  color: var(--text-muted);
}

.amount {
  margin: 8px 0;
  font-size: 34px;
  font-weight: 700;
}

.desc {
  margin: 0;
  color: var(--text-muted);
}
</style>

<template>
  <div v-if="visible" class="sheet-mask">
    <section class="sheet">
      <h3>微信支付确认</h3>
      <p>确认支付后将进入处理中状态。</p>
      <div class="actions">
        <button type="button" class="ghost" @click="$emit('cancel')">取消</button>
        <button type="button" class="primary" @click="$emit('confirm')">确认支付</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<style scoped>
.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: grid;
  place-items: end center;
  padding: 20px;
}

.sheet {
  width: min(560px, 100%);
  border-radius: 18px;
  background: #fff;
  padding: 20px;
  animation: slide-up 0.25s ease;
}

.sheet h3 {
  margin: 0;
}

.sheet p {
  color: var(--text-muted);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
}

.ghost {
  background: #edf5f2;
}

.primary {
  background: var(--brand);
  color: #fff;
}

@keyframes slide-up {
  from {
    transform: translateY(18px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>

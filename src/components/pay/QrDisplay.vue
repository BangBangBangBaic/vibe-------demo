<template>
  <section class="qr-wrap">
    <div v-if="loading" class="placeholder">二维码生成中...</div>
    <img v-else-if="dataUrl" :src="dataUrl" alt="收款二维码" class="qr-image" />
    <div v-else class="placeholder">请先创建订单</div>
    <p class="hint">请使用微信扫码进入支付页</p>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { toQrDataUrl } from '../../utils/qrcode'

const props = defineProps<{
  content: string
}>()

const loading = ref(false)
const dataUrl = ref('')

watch(
  () => props.content,
  async (value) => {
    if (!value) {
      dataUrl.value = ''
      return
    }

    loading.value = true
    dataUrl.value = await toQrDataUrl(value)
    loading.value = false
  },
  { immediate: true }
)
</script>

<style scoped>
.qr-wrap {
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  background: #fff;
}

.qr-image {
  width: 280px;
  max-width: 100%;
  border-radius: 12px;
}

.placeholder {
  padding: 40px 14px;
  color: var(--text-muted);
  background: var(--surface-soft);
  border-radius: 12px;
}

.hint {
  color: var(--text-muted);
  margin: 10px 0 0;
}
</style>

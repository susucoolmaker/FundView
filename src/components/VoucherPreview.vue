<script setup lang="ts">
import { reactive } from 'vue'
import { showImagePreview } from 'vant'

const props = defineProps<{
  images: string[]
}>()

const failedImages = reactive(new Set<string>())

const markAsFailed = (image: string) => {
  failedImages.add(image)
}

const openPreview = (index: number) => {
  if (failedImages.has(props.images[index]!)) return
  showImagePreview({
    images: props.images,
    startPosition: index,
    closeable: true,
  })
}
</script>

<template>
  <p v-if="!images.length" class="voucher-preview__empty">暂无资金凭证</p>
  <div v-else class="voucher-preview__grid">
    <button
      v-for="(image, index) in images"
      :key="`${image}-${index}`"
      type="button"
      class="voucher-preview__thumbnail"
      data-testid="voucher-thumbnail"
      :aria-label="failedImages.has(image) ? `第 ${index + 1} 张凭证加载失败` : `预览第 ${index + 1} 张凭证`"
      @click="openPreview(index)"
    >
      <img
        v-if="!failedImages.has(image)"
        :src="image"
        alt="资金凭证"
        data-testid="voucher-image"
        style="object-fit: contain"
        @error="markAsFailed(image)"
      />
      <span v-else class="voucher-preview__error" data-testid="voucher-error">
        <b aria-hidden="true">!</b>
        凭证加载失败
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.voucher-preview__empty {
  display: grid;
  min-height: 160px;
  margin: 0;
  place-items: center;
  color: var(--color-text-tertiary);
  font-size: 24px;
  background: #fafafa;
  border: 1px dashed var(--color-border);
  border-radius: 16px;
}

.voucher-preview__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.voucher-preview__thumbnail {
  position: relative;
  display: grid;
  width: 100%;
  min-width: 0;
  aspect-ratio: 4 / 3;
  padding: 0;
  overflow: hidden;
  place-items: center;
  background: #f8f8f8;
  border: 1px solid var(--color-border);
  border-radius: 16px;
}

.voucher-preview__thumbnail:active {
  border-color: var(--color-primary);
}

.voucher-preview__thumbnail img {
  width: 100%;
  height: 100%;
  background: #fff;
}

.voucher-preview__error {
  display: grid;
  gap: 8px;
  color: var(--color-text-tertiary);
  font-size: 22px;
}

.voucher-preview__error b {
  display: grid;
  width: 44px;
  height: 44px;
  margin: 0 auto;
  place-items: center;
  color: var(--color-failure);
  font-size: 26px;
  border: 2px solid currentColor;
  border-radius: 50%;
}
</style>

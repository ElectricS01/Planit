<template>
  <div class="model-background">
    <div class="modal" :class="{ 'is-active': isActive }" @click="closeModal">
      <div @click.stop>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isActive: {
    default: false,
    type: Boolean
  }
})
const emit = defineEmits(["close"])

const closeModal = () => emit("close")
</script>

<style scoped>
.model-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 3;
}

.modal {
  width: 100%;
  height: 100%;
  display: none;
  overflow-y: auto;
}

.is-active {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

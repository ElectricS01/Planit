<!--
    ModalSimple.vue is a simpler version of Modal.vue which doesn't contain any of the extra UI for the menu,
    it only dims the background and shows the menu content in the centre of the page
-->

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
// These are the properties that can be passed to the component
defineProps({
  isActive: {
    default: false,
    type: Boolean
  }
})

// This is an event that can be sent out of the component and back to where it is called
const emit = defineEmits(["close"])

// This function closes the model
const closeModal = () => emit("close")
</script>

<style scoped>
/* Styling for the menu */
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

<template>
  <div class="container">
    <p class="title">Welcome to Planit</p>
    <p class="title-small">Welcome to Planit</p>
    <router-link v-if="store.userData.id" to="/projects" class="menu-button">
      Go to Projects
    </router-link>
    <router-link v-else to="/login" class="menu-button">
      Go to Login
    </router-link>
  </div>
</template>

<script setup>
import { useDataStore } from "../store.js"

const store = useDataStore()
</script>

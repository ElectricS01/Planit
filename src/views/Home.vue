<!--
    Home.vue welcomes you to Planit, it has a button which updates based on whether you are logged in or not,
    this button takes you to login if you aren't logged in or takes you to your projects if you are.
    This button allows you to quickly change pages and helps new users navigate Planit. Home.vue is shown at /
-->

<template>
  <div class="container">
    <p class="title">Welcome to Planit</p>
    <p class="title-small">Welcome to Planit</p>
    <!-- Button that updates if the user is logged in -->
    <router-link v-if="store.userData.id" to="/projects" class="menu-button">
      Go to Projects
    </router-link>
    <router-link v-else to="/login" class="menu-button">
      Go to Login
    </router-link>
  </div>
</template>

<script setup>
// Import and define the store to access global variables in this file
import { useDataStore } from "../store.js"

const store = useDataStore()
</script>

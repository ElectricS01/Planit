<!--
    404.vue is shown at /404 and when the user tries to access an invalid URL,
    it has a button which redirects you back to the home page
-->

<template>
  <div class="container">
    <p class="title">Error 404: page not found</p>
    <router-link to="/" class="menu-button">Go to Home</router-link>
  </div>
</template>

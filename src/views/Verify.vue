<!--
    Verify.vue has a menu with a button that uses the token in the route params (the website URL) to
    verify your account's email address so that users know that you are who you say you are
-->

<template>
  <div class="container-flex">
    <div class="small-menu">
      <p>Verify your account</p>
      // This button calls the submit function
      <button style="margin-top: 12px" @click="submit">Verify</button>
    </div>
  </div>
</template>

<script setup>
// Import functions used in this file
import { useRoute, useRouter } from "vue-router"
import { useDataStore } from "../store.js"
import axios from "axios"

// Define these functions to be called
const route = useRoute()
const router = useRouter()
const store = useDataStore()

// This function sends the token in the route params (URL) to the backend for verification, if it is valid
// the user is redirected back to the projects page
const submit = () => {
  store.error = ""
  axios
    .post("/api/verify", {
      token: route.query.token
    })
    .then(() => {
      router.push("/projects")
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
</script>

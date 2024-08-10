<template>
  <div class="container-flex">
    <div class="small-menu">
      <p>Verify your account</p>
      <button style="margin-top: 12px" @click="submit">Verify</button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router"
import { useDataStore } from "../store.js"
import axios from "axios"

const route = useRoute()
const router = useRouter()
const store = useDataStore()

document.getElementById("favicon").href = "/icons/favicon.ico"

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

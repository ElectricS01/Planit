<template>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">{{ currentProject?.name }}</p>
      <p class="title-sub">Tasks</p>
      <div class="spacer" />
      <div class="menu-section">
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { ref, onMounted } from "vue"
const route = useRoute()
const currentProject = ref({})
async function getProject(id) {
  await axios
    .get(`/api/project/${id}`)
    .then((res) => {
      currentProject.value = res.data
      currentProject.value.messages.focus = false
    })
    .catch((e) => {
      if (e.response?.status === 400) {
        router.push("/projects")
      } else if (e.response?.status !== 401) {
        store.error = `Error ${e.request.status}, ${
          e.response.data.message || e.request.statusMessage
        }`
        setTimeout(store.errorFalse, 5000)
      }
    })
}

onMounted(async () => {
  await getProject(route.params.id)
})
</script>

<template>
  <div class="container-flex">
    <div class="menu">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
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

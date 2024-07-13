<template>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">Projects</p>
      <p>All projects which you own or have access to</p>
      <div
        v-for="(project, index) in store.userData.projects"
        :id="'project-' + index"
        :key="project.id"
      >
        <div class="spacer" />
        <p class="medium">
          {{ project.title }}
        </p>
        <p>{{ project.description }}</p>

        <div class="project">
          <p>{{ displayTime(project.start, false) }}</p>
          <p>{{ displayTime(project.end, true) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useRouter } from "vue-router"
import { useDataStore } from "../store.js"

const router = useRouter()
const store = useDataStore()

dayjs.extend(relativeTime)

if (!localStorage.getItem("token")) {
  router.push("/login")
}

const displayTime = (date, end) => {
  const hoursDifference = dayjs(date).diff(dayjs(), "hour")
  if (dayjs(date) > dayjs()) {
    if (hoursDifference > 24) {
      if (end) {
        return `Ends on ${dayjs(date).format("DD/MM/YYYY HH:mm:ss")}`
      } else {
        return `Starts on ${dayjs(date).format("DD/MM/YYYY HH:mm:ss")}`
      }
    } else {
      if (end) {
        return `Ends in ${dayjs(date).fromNow(true)}`
      } else {
        return `Starts in ${dayjs(date).fromNow(true)}`
      }
    }
  } else if (!end && dayjs(end) > dayjs()) {
    return "Currently Occurring"
  } else if (end) {
    return "Project is complete"
  }
}
</script>

<template>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">Projects</p>
      <p class="title-sub">Your projects</p>
      <div class="spacer" />
      <div class="menu-section">
        <div class="box">
          <div class="project-item" @click="">
            <img
              src="https://i.electrics01.com/i/d81dabf74c88.png"
              alt="Create a new project"
              class="grid-image"
            />
            <div class="small-container">
              <p class="text-medium">Create a New Project</p>
              <div class="spacer" />
              <p class="text-medium-grey">
                Create a New Planit Project, Customise Permissions, Add Graphs
              </p>
            </div>
          </div>
        </div>
        <div
          v-for="(project, index) in store.userData.projects"
          :id="'project-' + index"
          :key="project.id"
          class="box"
        >
          <router-link class="project-item" to="/projects">
            <img
              src="https://i.electrics01.com/i/d81dabf74c88.png"
              alt="Create a new project"
              class="grid-image"
            />
            <div class="small-container">
              <p class="text-medium">
                {{ project.title }}
              </p>
              <p class="text-medium-grey">{{ project.description }}</p>
              <div class="project">
                <p>{{ displayTime(project.start, false) }}</p>
                <p>{{ displayTime(project.end, true) }}</p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      <p class="title-sub">Shared with you</p>
      <div class="spacer" />
      <div class="menu-section">
        <p v-if="!store.userData.projects?.length">
          You don't have any projects shared with you
        </p>
        <div
          v-for="(project, index) in store.userData.projects"
          :id="'project-' + index"
          :key="project.id"
          class="box"
        >
          <router-link class="project-item" to="/projects"">
            <img
              src="https://i.electrics01.com/i/d81dabf74c88.png"
              alt="Create a new project"
              class="grid-image"
            />
            <div class="small-container">
              <p class="text-medium">
                {{ project.title }}
              </p>
              <p class="text-medium-grey">{{ project.description }}</p>
              <div class="project">
                <p>{{ displayTime(project.start, false) }}</p>
                <p>{{ displayTime(project.end, true) }}</p>
              </div>
            </div>
          </router-link>
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

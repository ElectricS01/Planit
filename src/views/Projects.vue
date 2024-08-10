<!--
    Projects.vue contains the main page of Planit, this page displays all projects that you have
    created and all projects that you've been invited to
-->

<template>
  <!-- This menu is for creating projects -->
  <Transition>
    <modal
      v-if="
        createShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      :is-active="
        createShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      @close="
        ;(createShown = false),
          (projectNameInput = ''),
          (projectDescriptionInput = ''),
          (projectIconInput = ''),
          (projectUsers = [])
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Create New Project</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="project-name">Project name</label>
          </div>
          <input
            id="project-name"
            v-model="projectNameInput"
            placeholder="Project name"
            @keydown.enter="createProject"
          />
          <div class="text-small">
            <label for="project-description">Project description</label>
          </div>
          <input
            id="project-description"
            v-model="projectDescriptionInput"
            placeholder="Project description"
            @keydown.enter="createProject"
          />
          <div class="text-small">
            <label for="project-background">Project background image</label>
          </div>
          <input
            id="project-background"
            v-model="projectIconInput"
            placeholder="Project background URL"
            @keydown.enter="createProject"
          />
        </div>
        <div class="text-small">
          <label for="add-user">Add a user</label>
        </div>
        <input
          id="add-user"
          v-model="projectUserInput"
          placeholder="Add a user"
          @keydown.enter="projectUserEnter"
        />
        <div v-if="projectUsers.length">Permissions:</div>
        <div
          v-for="(user, index) in projectUsers"
          :key="user.type"
          class="switcher-item"
        >
          {{ user.user.username }}
          <button @click="swapPermission(index)">
            {{ user.type === 2 ? "Viewer" : "Editor" }}
          </button>
          <button @click="removePermission(index)">Remove</button>
        </div>
        <button @click="createProject">Create</button>
      </div>
    </modal>
  </Transition>
  <!-- This menu is for editing projects -->
  <Transition>
    <modal
      v-if="
        editShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !deleteShown
      "
      :is-active="
        editShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !deleteShown
      "
      @close="
        ;(editShown = false),
          (projectNameInput = ''),
          (projectDescriptionInput = ''),
          (projectIconInput = ''),
          (projectUsers = [])
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Edit {{ editingProject.name }}</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="project-name">Project name</label>
          </div>
          <input
            id="project-name"
            v-model="projectNameInput"
            placeholder="Project name"
            @keydown.enter="editProject"
          />
          <div class="text-small">
            <label for="project-description">Project description</label>
          </div>
          <input
            id="project-description"
            v-model="projectDescriptionInput"
            placeholder="Project description"
            @keydown.enter="editProject"
          />
          <div class="text-small">
            <label for="project-background">Project background image</label>
          </div>
          <input
            id="project-background"
            v-model="projectIconInput"
            placeholder="Project background URL"
            @keydown.enter="editProject"
          />
        </div>
        <div class="text-small">
          <label for="add-user">Add a user</label>
        </div>
        <input
          id="add-user"
          v-model="projectUserInput"
          placeholder="Add a user"
          @keydown.enter="projectUserEnter"
        />
        <div v-if="projectUsers.length">Permissions:</div>
        <div
          v-for="(user, index) in projectUsers"
          :key="user.type"
          class="switcher-item"
        >
          {{ user.user?.username }}
          <button
            v-if="user.userId !== store.userData.id"
            @click="swapPermission(index)"
          >
            {{ user.type === 2 ? "Viewer" : "Editor" }}
          </button>
          <button
            v-if="user.userId !== store.userData.id"
            @click="removePermission(index)"
          >
            Remove
          </button>
          <b v-else>(me)</b>
        </div>
        <button @click="editProject">Save</button>
        <button
          v-if="editingProject.owner === store.userData.id"
          style="color: red"
          @click="deleteShown = true"
        >
          Delete
        </button>
      </div>
    </modal>
  </Transition>
  <!-- This menu is for deleting projects -->
  <Transition>
    <modal
      v-if="
        deleteShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      :is-active="
        deleteShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      @close="deleteShown = false"
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Delete {{ editingProject.name }}</p>
        </div>
        <div>
          <div class="text-small">
            <label for="project-description">
              Enter your password to delete {{ editingProject.name }}
            </label>
          </div>
          <input
            id="project-description"
            v-model="password"
            placeholder="Password"
            type="password"
            @keydown.enter="deleteProject"
          />
        </div>
        <button @click="deleteShown = false">Cancel</button>
        <button style="color: red" @click="deleteProject">Delete</button>
      </div>
    </modal>
  </Transition>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">Projects</p>
      <p class="title-sub">Your projects</p>
      <div class="spacer" />
      <div class="menu-section">
        <!-- This is visible if your projects have loaded -->
        <div v-if="!store.loadingProjects" class="menu-container">
          <!-- This button opens the create projects menu -->
          <div class="box">
            <div class="project-item" @click="createShown = true">
              <img
                src="https://i.electrics01.com/i/d81dabf74c88.png"
                alt="Create a new project"
                class="grid-image"
              />
              <div class="small-container">
                <div style="display: inline-flex">
                  <p class="text-medium">Create a New Project</p>
                </div>
                <div class="spacer" />
                <p class="text-medium-grey">
                  Create a New Planit Project, Customise Permissions, Add Graphs
                </p>
              </div>
            </div>
          </div>
          <!-- This is a for loop which displays all projects that you've made -->
          <div
            v-for="(project, index) in myProjects"
            :id="'project-' + index"
            :key="project.id"
            class="box"
          >
            <router-link class="project-item" :to="`/project/${project.id}`">
              <img
                :src="
                  project.icon || 'https://i.electrics01.com/i/d81dabf74c88.png'
                "
                alt="Project background"
                class="grid-image"
              />
              <div class="small-container">
                <div class="title-container">
                  <p class="text-medium">
                    {{ project.name }}
                  </p>
                  <icons
                    class="edit-button"
                    :size="16"
                    icon="edit"
                    @click.prevent="
                      (editShown = true),
                        (editingProject = project),
                        (projectNameInput = project.name),
                        (projectDescriptionInput = project.description),
                        (projectIconInput = project.icon),
                        (projectUsers = project.permissions.slice())
                    "
                  />
                </div>
                <div class="spacer" />
                <p class="text-wrap-grey">{{ project.description }}</p>
                <p v-if="isComplete(project.latest)" class="text-wrap-grey">
                  There are no upcoming tasks
                </p>
                <div v-else>
                  <p class="text-wrap-grey">
                    Next task: {{ displayTime(project.latest, false) }}
                  </p>
                  <p class="text-wrap-grey">
                    Last task: {{ displayTime(project.end, true) }}
                  </p>
                </div>
              </div>
            </router-link>
          </div>
        </div>
        <!-- This is visible if your projects have not loaded -->
        <div v-else class="center">
          <div style="text-align: center" class="loader" />
        </div>
      </div>
      <p class="title-sub">Shared with you</p>
      <div class="spacer" />
      <div class="menu-section">
        <!-- This is visible if your projects have loaded -->
        <div v-if="!store.loadingProjects" class="menu-container">
          <!-- This is a for loop which displays all projects that are shared to you -->
          <div
            v-for="(project, index) in sharedProjects"
            :id="'project-' + index"
            :key="project.id"
            class="box"
          >
            <router-link class="project-item" :to="`/project/${project.id}`">
              <img
                :src="
                  project.icon || 'https://i.electrics01.com/i/d81dabf74c88.png'
                "
                alt="Project background"
                class="grid-image"
              />
              <div class="small-container">
                <div class="title-container">
                  <p class="text-medium">
                    {{ project.name }}
                  </p>
                  <p
                    style="margin: 3px 0 0 4px; min-width: fit-content"
                    class="text-wrap-grey"
                  >
                    Shared by {{ project.ownerDetails.username }}
                  </p>
                </div>
                <div class="spacer" />
                <p class="text-wrap-grey">{{ project.description }}</p>
                <p v-if="isComplete(project.latest)" class="text-wrap-grey">
                  There are no upcoming tasks
                </p>
                <div v-else class="date-container">
                  <p class="text-wrap-grey">
                    Next task: {{ displayTime(project.latest, false) }}
                  </p>
                  <p class="text-wrap-grey">
                    Last task: {{ displayTime(project.end, true) }}
                  </p>
                </div>
              </div>
            </router-link>
          </div>
        </div>
        <div v-else class="center">
          <div style="text-align: center" class="loader" />
        </div>
        <!-- This is visible if your projects have not loaded -->
        <p v-if="!sharedProjects?.length && !store.loadingProjects">
          You don't have any projects shared with you
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// import components to be used in this file
import Modal from "../components/Modal.vue"
import Icons from "../components/Icons.vue"

// Import functions used in this file
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useRouter } from "vue-router"
import axios from "axios"
import { useDataStore } from "../store.js"
import { computed, ref } from "vue"

// Define these functions to be called
const router = useRouter()
const store = useDataStore()

// These variables are for menus
const createShown = ref(false)
const editShown = ref(false)
const deleteShown = ref(false)
const editingProject = ref({})

// These variables store the values of inputs
const projectUserInput = ref("")
const projectUsers = ref([])

let projectNameInput
let projectDescriptionInput
let projectIconInput
let password

// This adds an additional library to Day.js
dayjs.extend(relativeTime)

// If the user isn't logged in then send them to the login page
if (!localStorage.getItem("token")) {
  router.push("/login")
}

// This function swpas the user's permission to a project
const swapPermission = (index) => {
  projectUsers.value[index].type = projectUsers.value[index].type === 1 ? 2 : 1
}

// This fun removes a user's permission from the project
const removePermission = (index) => {
  projectUsers.value.splice(index, 1)
}

// This function takes in the users password and the project to be deleted then posts this data to the delete-project API.
// Afterward it removes that project from the projects list and hides the project deletion menu
const deleteProject = () => {
  console.log(editingProject.value.id)
  axios
    .post("/api/delete-project", {
      id: editingProject.value.id,
      password
    })
    .then(() => {
      store.userData.projects.splice(
        store.userData.projects.indexOf(
          store.userData.projects.find(
            (project) => project.id === editingProject.value.id
          )
        ),
        1
      )
      deleteShown.value = false
      editShown.value = false
      password = ""
      projectNameInput = ""
      projectDescriptionInput = ""
      projectIconInput = ""
      projectUsers.value = []
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}

// Takes in the id of the edited projectm the new description, new name, new icon, and new permissions,
// then posts them to the edit-project API. Finally it closes the edit menu and edit the project in the projects list
const editProject = () => {
  if (
    editShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !deleteShown.value
  )
    axios
      .patch("/api/edit-project", {
        id: editingProject.value.id,
        description: projectDescriptionInput,
        icon: projectIconInput,
        name: projectNameInput,
        users: projectUsers.value
      })
      .then((res) => {
        store.userData.projects[
          store.userData.projects.indexOf(
            store.userData.projects.find(
              (project) => project.id === res.data.project.id
            )
          )
        ] = res.data.project
        editShown.value = false
        projectNameInput = ""
        projectDescriptionInput = ""
        projectIconInput = ""
        projectUsers.value = []
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
}

// This function is similar to the editProject function, it takes in a name, description, icon, and permissions,
// then it posts them to the create-project API which returns a project which is then added to the user's projects list.
// Finally the project creation menu is hidden.
const createProject = () => {
  if (
    createShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !deleteShown.value
  )
    axios
      .post("/api/create-project", {
        description: projectDescriptionInput,
        icon: projectIconInput,
        name: projectNameInput,
        users: projectUsers.value
      })
      .then((res) => {
        store.userData.projects.push(res.data.project)
        store.switcherItems.push(
          ...[res.data.project].map((obj) => [
            obj.type === 1 && obj.ownerDetails.id !== store.userData.value.id
              ? obj.ownerDetails.username
              : obj.name,
            obj.id
          ])
        )
        store.sortProjects()
        router.push(`/project/${res.data.project.id}`)
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
}

// This function adds a user's permission to a project, the default permission is "Viewer"
// to avoid accidentally giving a user too much access to the project
const projectUserEnter = async () => {
  if (projectUserInput.value === store.userData.username) {
    store.error = "You cannot add yourself"
    setTimeout(store.errorFalse, 2500)
    projectUserInput.value = ""
    return
  }
  const userId = await getUserByName(projectUserInput.value)
  if (!userId) return
  if (projectUsers.value.find((user) => user.userId === userId.id)) {
    store.error = "This user is already a part of this group"
    setTimeout(store.errorFalse, 2500)
    projectUserInput.value = ""
    return
  }
  projectUsers.value.push({
    userId: userId.id,
    type: 2,
    user: { username: projectUserInput.value }
  })
  projectUserInput.value = ""
}

// This function is used by the projectUserEnter function to get a user's ID number
// from their username using the get-user API, it takes a username and returns an ID number
const getUserByName = async (username) => {
  try {
    const response = await axios.post("/api/get-user", {
      username
    })
    return response.data
  } catch (e) {
    store.error = e.response?.data || e.message
    setTimeout(store.errorFalse, 5000)
  }
}

// This function checks if a given date and time has already passed
const isComplete = (latest) => {
  if (dayjs(latest) < dayjs()) return true
}

// This function returns the formatted date, it takes a given date and a variable to see
// if it's an end date or a start date, then returns the formatted date
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
  } else {
    return "No due date"
  }
}

// Computed variables are vraiables that update when reactive (ref or computed) variable
// that they depend on updates, the myProjects computed variable returns all projects that you created
const myProjects = computed(() => {
  if (store.userData.projects)
    return store.userData.projects.filter(
      (project) => project?.owner === store.userData.id
    )
  return []
})

// This computed variable returns projects with owners that are not you
const sharedProjects = computed(() => {
  if (store.userData.projects)
    return store.userData.projects.filter(
      (project) => project?.owner !== store.userData.id
    )
  return []
})
</script>

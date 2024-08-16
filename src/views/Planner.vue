<!--
    Planner.vue contains the page for each project, it gets, displays, and edits a project's
    tasks, resources, and charts
-->

<template>
  <!-- This menu is for creating tasks -->
  <transition>
    <modal
      v-if="
        createShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createResourceShown &&
        !editResourceShown
      "
      :is-active="
        createShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createResourceShown &&
        !editResourceShown
      "
      @close="
        ;(createShown = false),
          (taskNameInput = ''),
          (taskDescriptionInput = ''),
          (taskIconInput = ''),
          (taskStartInput = ''),
          (taskEndInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Create New Task</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="task-name">Task name</label>
          </div>
          <input
            id="task-name"
            v-model="taskNameInput"
            placeholder="Task name"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-description">Task description</label>
          </div>
          <input
            id="task-description"
            v-model="taskDescriptionInput"
            placeholder="Task description"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-background">Task background image</label>
          </div>
          <input
            id="task-background"
            v-model="taskIconInput"
            placeholder="Task background URL"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-start">Task start date</label>
          </div>
          <input
            id="task-start"
            v-model="taskStartInput"
            placeholder="MM/DD/YYYY"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-end">Task end date</label>
          </div>
          <input
            id="task-end"
            v-model="taskEndInput"
            placeholder="MM/DD/YYYY"
            @keydown.enter="createTask"
          />
        </div>
        <button @click="createTask">Create</button>
      </div>
    </modal>
  </transition>
  <!-- This menu is for editing tasks -->
  <transition>
    <modal
      v-if="
        editShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !createShown &&
        !createResourceShown &&
        !editResourceShown
      "
      :is-active="
        editShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !createShown &&
        !createResourceShown &&
        !editResourceShown
      "
      @close="
        ;(editShown = false),
          (taskNameInput = ''),
          (taskDescriptionInput = ''),
          (taskIconInput = ''),
          (taskStartInput = ''),
          (taskEndInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Edit {{ editingTask.name }}</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="task-name">Task name</label>
          </div>
          <input
            id="task-name"
            v-model="taskNameInput"
            placeholder="Task name"
            @keydown.enter="editTask"
          />
          <div class="text-small">
            <label for="task-description">Task description</label>
          </div>
          <input
            id="task-description"
            v-model="taskDescriptionInput"
            placeholder="Task description"
            @keydown.enter="editTask"
          />
          <div class="text-small">
            <label for="task-background">Task background image</label>
          </div>
          <input
            id="task-background"
            v-model="taskIconInput"
            placeholder="Task background URL"
            @keydown.enter="editTask"
          />
          <div class="text-small">
            <label for="task-start">Task start date</label>
          </div>
          <input
            id="task-start"
            v-model="taskStartInput"
            placeholder="MM/DD/YYYY"
            @keydown.enter="editTask"
          />
          <div class="text-small">
            <label for="task-end">Task end date</label>
          </div>
          <input
            id="task-end"
            v-model="taskEndInput"
            placeholder="MM/DD/YYYY"
            @keydown.enter="editTask"
          />
        </div>
        <button @click="editTask">Edit</button>
        <button
          v-if="currentProject.owner === store.userData.id"
          style="color: red"
          @click="deleteTask"
        >
          Delete
        </button>
      </div>
    </modal>
  </transition>
  <!-- This menu is for creating resources -->
  <transition>
    <modal
      v-if="
        createResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createShown &&
        !editResourceShown
      "
      :is-active="
        createResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createShown &&
        !editResourceShown
      "
      @close="
        ;(createResourceShown = false),
          (resourceNameInput = ''),
          (resourceDescriptionInput = ''),
          (resourceIconInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Create New Resource</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="task-name">Resource name</label>
          </div>
          <input
            id="task-name"
            v-model="resourceNameInput"
            placeholder="Task name"
            @keydown.enter="createResource"
          />
          <div class="text-small">
            <label for="task-description">Resource description</label>
          </div>
          <input
            id="task-description"
            v-model="resourceDescriptionInput"
            placeholder="Task description"
            @keydown.enter="createResource"
          />
          <div class="text-small">
            <label for="task-background">Resource background image</label>
          </div>
          <input
            id="task-background"
            v-model="resourceIconInput"
            placeholder="Task background URL"
            @keydown.enter="createResource"
          />
        </div>
        <button @click="createResource">Create</button>
      </div>
    </modal>
  </transition>
  <!-- This menu is for editing resources -->
  <transition>
    <modal
      v-if="
        editResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createShown &&
        !createResourceShown
      "
      :is-active="
        editResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createShown &&
        !createResourceShown
      "
      @close="
        ;(editResourceShown = false),
          (resourceNameInput = ''),
          (resourceDescriptionInput = ''),
          (resourceIconInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Edit {{ editingResource.name }}</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="task-name">Resource name</label>
          </div>
          <input
            id="task-name"
            v-model="resourceNameInput"
            placeholder="Task name"
            @keydown.enter="editResource"
          />
          <div class="text-small">
            <label for="task-description">Resource description</label>
          </div>
          <input
            id="task-description"
            v-model="resourceDescriptionInput"
            placeholder="Task description"
            @keydown.enter="editResource"
          />
          <div class="text-small">
            <label for="task-background">Resource background image</label>
          </div>
          <input
            id="task-background"
            v-model="resourceIconInput"
            placeholder="Task background URL"
            @keydown.enter="editResource"
          />
        </div>
        <button @click="editResource">Save</button>
        <button
          v-if="currentProject.owner === store.userData.id"
          style="color: red"
          @click="deleteResource"
        >
          Delete
        </button>
      </div>
    </modal>
  </transition>
  <div class="container-flex" @click="ganttEdit = false">
    <div class="menu">
      <!-- Navigation buttons for changing pages -->
      <button :class="{ highlighted: page === 0 }" @click="page = 0">
        Tasks
      </button>
      <button :class="{ highlighted: page === 1 }" @click="page = 1">
        Gantt Chart
      </button>
      <button
        :class="{ highlighted: page === 2 }"
        @click="(page = 2), nextTick(() => drawPieChart())"
      >
        Graphs
      </button>
      <p class="title-menu">{{ currentProject?.name }}</p>
      <!-- Tasks and resources page, this contains a list of the project's tasks and resources -->
      <div v-if="page === 0">
        <p class="title-sub">Tasks</p>
        <div class="spacer" />
        <!-- This is visible if your project has loaded -->
        <div v-if="!loadingProject" class="menu-section">
          <!-- This button opens the create task menu, it is only visible if you are an editor or owner of this project -->
          <div
            v-if="
              currentProject.permissions.find(
                (permissions) => permissions.userId === store.userData.id
              )?.type !== 2
            "
            class="task-item"
            @click="(createShown = true), (typeOpen = -1), (addOpen = -1)"
          >
            <div class="task-sub">
              <img
                src="https://i.electrics01.com/i/3cdfb7b801b9.png"
                alt="Create a new task"
                class="task-image"
              />
              <p class="text-medium">Create a New Task</p>
            </div>
            <div class="task-container">
              <p class="text-medium-grey">
                Create a New Planit Task, Customise Description, Add Resources
              </p>
            </div>
          </div>
          <!-- these are check boxes to filter your tasks by their type -->
          <div class="toggle-container">
            <p>Filters:</p>
            <div class="checkbox-container">
              <input
                id="pending"
                type="checkbox"
                :checked="pendingTasks"
                @click="toggle('pending')"
              />
              <label for="pending">Pending</label>
            </div>
            <div class="checkbox-container">
              <input
                id="ongoing"
                type="checkbox"
                :checked="ongoingTasks"
                @click="toggle('ongoing')"
              />
              <label for="ongoing">Ongoing</label>
            </div>
            <div class="checkbox-container">
              <input
                id="complete"
                type="checkbox"
                :checked="completedTasks"
                @click="toggle('complete')"
              />
              <label for="complete">Complete</label>
            </div>
            <div class="checkbox-container">
              <input
                id="hidden"
                type="checkbox"
                :checked="hiddenTasks"
                @click="toggle('hidden')"
              />
              <label for="hidden">Hidden</label>
            </div>
          </div>
          <div class="spacer" />
          <!-- This message is visiable if your project doesn't have any tasks -->
          <p v-if="!currentProject.tasks?.length">This project has no tasks</p>
          <!-- This message is shown if you're filters have hidden all the tasks -->
          <p v-else-if="!currentTasks?.length">No tasks match your filters</p>
          <!-- This is a for loop which displays all the project's tasks -->
          <div
            v-for="(task, index) in currentTasks"
            :id="'task-' + index"
            :key="task.id"
            class="task-item"
            @click="
              (editShown = true),
                (typeOpen = -1),
                (addOpen = -1),
                (editingTask = task),
                (taskNameInput = task.name),
                (taskDescriptionInput = task.description),
                (taskIconInput = task.icon),
                (taskStartInput = task.startAt
                  ? dayjs(task.startAt).format('MM/DD/YYYY')
                  : ''),
                (taskEndInput = task.dueAt
                  ? dayjs(task.dueAt).format('MM/DD/YYYY')
                  : '')
            "
          >
            <div class="task-sub">
              <object
                :src="
                  task.icon || 'https://i.electrics01.com/i/55bae440a2b3.png'
                "
                alt="Task background"
                class="task-image"
              >
                <img
                  src="https://i.electrics01.com/i/55bae440a2b3.png"
                  alt="Task background"
                  class="task-image"
                />
              </object>
              <p class="text-medium">
                {{ task.name }}
              </p>
            </div>
            <div class="task-container">
              <p class="text-medium-grey">{{ task.description }}</p>
              <div class="date-container">
                <p class="text-medium-grey" style="margin-right: 8px">
                  {{ displayTime(task.startAt, false) }}
                </p>
                <p class="text-medium-grey">
                  {{ displayTime(task.dueAt, true) }}
                </p>
              </div>
            </div>
            <div class="task-sub">
              <p
                v-if="
                  (task.resources?.length ||
                    currentProject.permissions.find(
                      (permissions) => permissions.userId === store.userData.id
                    )?.type !== 2) &&
                  currentProject.resources.length
                "
                class="text-medium"
              >
                Resources:
              </p>
              <div v-for="resource in task.resources" :key="resource.id">
                <button
                  style="display: flex; align-items: center"
                  @click.stop="
                    removeResource(resource.resourceId, resource.id, task.id)
                  "
                >
                  {{
                    currentProject.resources.find(
                      (res) => res.id === resource.resourceId
                    ).name
                  }}
                  <icons icon="close" :size="16"></icons>
                </button>
              </div>
              <div
                v-if="
                  currentProject.permissions.find(
                    (permissions) => permissions.userId === store.userData.id
                  )?.type !== 2 &&
                  task.resources.length !== currentProject.resources.length
                "
                class="dropdown"
              >
                <div
                  class="dropdown-toggle"
                  @click.stop="
                    (addOpen = addOpen === index ? -1 : index), (typeOpen = -1)
                  "
                >
                  Add
                </div>
                <ul v-if="addOpen === index" class="dropdown-menu">
                  <li
                    v-for="option in options"
                    :key="option"
                    @click.stop="addResource(task.id, option.id)"
                  >
                    {{ option.name }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="dropdown-fixed">
              <div
                v-if="
                  currentProject.permissions.find(
                    (permissions) => permissions.userId === store.userData.id
                  )?.type !== 2
                "
                class="dropdown-toggle"
                @click.stop="
                  (typeOpen = typeOpen === index ? -1 : index), (addOpen = -1)
                "
              >
                {{ typeOptions[task.type] }}
              </div>
              <p v-else>{{ typeOptions[task.type] }}</p>
              <ul v-if="typeOpen === index" class="dropdown-menu">
                <li
                  v-for="(option, optionIndex) in typeOptions"
                  :key="option"
                  @click.stop="changeType(task, optionIndex)"
                >
                  {{ option }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- This loading spinner is visible if your projects have not loaded -->
        <div v-else class="menu-section">
          <div class="center">
            <div style="text-align: center" class="loader" />
          </div>
        </div>
        <p class="title-sub">Resources</p>
        <div class="spacer" />
        <!-- This is visible if your project has loaded -->
        <div v-if="!loadingProject" class="menu-section">
          <!-- This button opens the create resource menu, it is only visible if you are an editor or owner of this project -->
          <div
            v-if="
              currentProject.permissions.find(
                (permissions) => permissions.userId === store.userData.id
              )?.type !== 2
            "
            class="task-item"
            @click="
              (createResourceShown = true), (typeOpen = -1), (addOpen = -1)
            "
          >
            <div class="task-sub">
              <img
                src="https://i.electrics01.com/i/10f2400e2ad0.png"
                alt="Create a new resource"
                class="task-image"
              />
              <p class="text-medium">Create a New Resource</p>
            </div>
            <div class="task-container">
              <p class="text-medium-grey">
                Create a New Planit Resource, Customise Name and Description
              </p>
            </div>
          </div>
          <div class="spacer" />
          <!-- This message is visiable if your project doesn't have any resources -->
          <p v-if="!currentProject.resources?.length">
            This project has no resources
          </p>
          <!-- This is a for loop which displays all the project's tasks -->
          <div
            v-for="(resource, index) in currentProject.resources"
            :id="'resource-' + index"
            :key="resource.id"
            class="task-item"
            @click="
              (editResourceShown = true),
                (typeOpen = -1),
                (addOpen = -1),
                (editingResource = resource),
                (resourceNameInput = resource.name),
                (resourceDescriptionInput = resource.description),
                (resourceIconInput = resource.icon)
            "
          >
            <div class="task-sub">
              <object
                :src="
                  resource.icon ||
                  'https://i.electrics01.com/i/124bd47c48c7.png'
                "
                alt="Resource background"
                class="task-image"
              >
                <img
                  src="https://i.electrics01.com/i/124bd47c48c7.png"
                  alt="Resource background"
                  class="task-image"
                />
              </object>
              <p class="text-medium">
                {{ resource.name }}
              </p>
            </div>
            <div class="task-container">
              <p class="text-medium-grey">{{ resource.description }}</p>
            </div>
          </div>
        </div>
        <!-- This loading spinner is visible if your projects have not loaded -->
        <div v-else class="menu-section">
          <div class="center">
            <div style="text-align: center" class="loader" />
          </div>
        </div>
      </div>
      <!-- Gantt Chart page, this page contains a Gantt Chart -->
      <div v-else-if="page === 1" style="display: flex">
        <div class="table">
          <div class="table-row">
            <div class="table-box">Name</div>
            <div class="table-box">Description</div>
            <div class="table-box">Icon</div>
            <div class="table-box">Start</div>
            <div class="table-box">End</div>
            <div class="table-box">Resources</div>
          </div>
          <div
            v-for="(task, index) in currentProject.tasks"
            :key="task.id"
            class="table-row"
          >
            <div
              v-if="ganttEdit !== index || editType !== 0"
              class="table-box"
              @click.stop="
                (ganttEdit = index), (editType = 0), (taskNameInput = task.name)
              "
            >
              {{ task.name }}
            </div>
            <input
              v-else
              :id="'name-' + index"
              v-model="taskNameInput"
              class="table-input"
              @keydown.enter="ganttSave(task)"
              @click.stop=""
            />
            <div
              v-if="ganttEdit !== index || editType !== 1"
              class="table-box"
              @click.stop="
                (ganttEdit = index),
                  (editType = 1),
                  (taskDescriptionInput = task.description)
              "
            >
              {{ task.description }}
            </div>
            <input
              v-else
              :id="'description-' + index"
              v-model="taskDescriptionInput"
              class="table-input"
              @keydown.enter="ganttSave(task)"
              @click.stop=""
            />
            <div
              v-if="ganttEdit !== index || editType !== 2"
              class="table-box"
              @click.stop="
                (ganttEdit = index), (editType = 2), (taskIconInput = task.icon)
              "
            >
              {{ task.icon || "No icon" }}
            </div>
            <input
              v-else
              :id="'icon-' + index"
              v-model="taskIconInput"
              class="table-input"
              @keydown.enter="ganttSave(task)"
              @click.stop=""
            />
            <div
              v-if="ganttEdit !== index || editType !== 3"
              class="table-box"
              @click.stop="
                (ganttEdit = index),
                  (editType = 3),
                  (taskStartInput = task.startAt
                    ? dayjs(task.startAt).format('MM/DD/YYYY')
                    : '')
              "
            >
              {{ dayjs(task.startAt).format("MM/DD/YYYY HH:mm:ss") }}
            </div>
            <input
              v-else
              :id="'start-' + index"
              v-model="taskStartInput"
              class="table-input"
              @keydown.enter="ganttSave(task)"
              @click.stop=""
            />
            <div
              v-if="ganttEdit !== index || editType !== 4"
              class="table-box"
              @click.stop="
                (ganttEdit = index),
                  (editType = 4),
                  (taskEndInput = task.dueAt
                    ? dayjs(task.dueAt).format('MM/DD/YYYY')
                    : '')
              "
            >
              {{
                task.dueAt
                  ? dayjs(task.dueAt).format("MM/DD/YYYY HH:mm:ss")
                  : "No due date"
              }}
            </div>
            <input
              v-else
              :id="'end-' + index"
              v-model="taskEndInput"
              class="table-input"
              @keydown.enter="ganttSave(task)"
              @click.stop=""
            />
            <div
              v-if="ganttEdit !== index || editType !== 5"
              class="table-box"
              @click.stop="(ganttEdit = index), (editType = 5)"
            >
              {{ task.resources || "No icon" }}
            </div>
            <input v-else class="table-input" @click.stop="" />
          </div>
          <div
            v-if="
              currentProject.permissions.find(
                (permissions) => permissions.userId === store.userData.id
              )?.type !== 2
            "
            class="table-add"
            @click="createTask(true)"
          >
            +
          </div>
        </div>
        <div class="table" style="display: flex">
          <div>
            <div class="table-line-row">
              <div
                v-for="index in Math.max(dateRange.count, 7)"
                :key="index"
                class="table-box"
              >
                {{
                  dayjs(earliestTask?.startAt)
                    .add(index - 1, dateRange.type)
                    .format("DD/MM/YY")
                }}
              </div>
            </div>
            <div
              v-for="task in currentProject.tasks"
              :key="task.id"
              class="table-line-row"
            >
              <div class="table-line">
                <div
                  v-if="task.startAt && task.dueAt"
                  :style="{
                    left:
                      (dayjs(task.startAt).diff(
                        earliestTask.startAt,
                        dateRange.type,
                        true
                      ) /
                        dateRange.count) *
                        100 +
                      '%',
                    right:
                      (dayjs(task.dueAt).diff(
                        lastTask.dueAt,
                        dateRange.type,
                        true
                      ) /
                        -dateRange.count) *
                        100 +
                      '%'
                  }"
                  style="background-color: #00f; position: absolute"
                >
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Charts page containing an assortment of different charts -->
      <div v-else-if="page === 2">
        <p>Tasks</p>
        <canvas ref="canvas" width="400" height="400"></canvas>
        <p style="background-color: #ffd70780">Open tasks</p>
        <p style="background-color: #32cd3280">Complete tasks</p>
        <p style="background-color: #18181880">Hidden tasks</p>
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
import localizedFormat from "dayjs/plugin/localizedFormat"
import { useRouter, useRoute } from "vue-router"
import axios from "axios"
import { useDataStore } from "../store.js"
import { ref, onMounted, computed, nextTick } from "vue"

// Define these functions to be called
const route = useRoute()
const router = useRouter()
const store = useDataStore()

// These variables are for menus
const createShown = ref(false)
const editShown = ref(false)
const createResourceShown = ref(false)
const editResourceShown = ref(false)
const currentProject = ref({})
const editingTask = ref({})
const editingResource = ref({})
const loadingProject = ref(true)
const typeOpen = ref(-1)
const addOpen = ref(-1)
const page = ref(0)
const ganttEdit = ref(-1)
const editType = ref(-1)

// These variables are for filters
const pendingTasks = ref(true)
const ongoingTasks = ref(true)
const completedTasks = ref(false)
const hiddenTasks = ref(false)

// These variables store the values of inputs
const taskStartInput = ref("")
const taskEndInput = ref("")

let taskNameInput
let taskDescriptionInput
let taskIconInput
let resourceNameInput
let resourceDescriptionInput
let resourceIconInput

// Define an array to be reused
const typeOptions = ["hidden", "complete", "open"]

// This adds additional libraries to Day.js
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

// If the user isn't logged in then send them to the login page
if (!localStorage.getItem("token")) {
  router.push("/login")
}

// Get localStorage values for the filter buttons to avoid the user having to reset the filters every time
if (localStorage.getItem("pendingTasks")) {
  pendingTasks.value = localStorage.getItem("pendingTasks") === "true"
}
if (localStorage.getItem("ongoingTasks")) {
  ongoingTasks.value = localStorage.getItem("ongoingTasks") === "true"
}
if (localStorage.getItem("completedTasks")) {
  completedTasks.value = localStorage.getItem("completedTasks") === "true"
}
if (localStorage.getItem("hiddenTasks")) {
  hiddenTasks.value = localStorage.getItem("hiddenTasks") === "true"
}

// This computed variable updates when you change the filter toggles
const currentTasks = computed(() =>
  currentProject.value.tasks.filter(
    (task) =>
      (task.type === 2 &&
        pendingTasks.value &&
        dayjs(task.startAt) > dayjs()) ||
      (task.type === 2 &&
        ongoingTasks.value &&
        dayjs(task.startAt) < dayjs()) ||
      (task.type === 1 && completedTasks.value) ||
      (task.type === 0 && hiddenTasks.value)
  )
)

// This computed variable updates when you add resources to tasks
const options = computed(() => {
  return currentProject.value.resources.filter(
    (resource) =>
      currentTasks.value[addOpen.value].resources.length === 0 ||
      !currentTasks.value[addOpen.value].resources.find(
        (res) => res.resourceId === resource.id
      )
  )
})

// Find the earliest task in the project
const earliestTask = computed(() => {
  return currentProject.value.tasks.reduce((earliest, task) => {
    if (!earliest || task.startAt < earliest.startAt) {
      return task
    }
    return earliest
  }, null)
})

// Find the last task in the project
const lastTask = computed(() => {
  return currentProject.value.tasks.reduce((earliest, task) => {
    if (!earliest?.dueAt || task?.dueAt > earliest?.dueAt) {
      return task
    }
    return earliest
  }, null)
})

const dateRange = computed(() => {
  if (currentProject.value.tasks.length === 0) return { count: 0, type: "day" }
  if (dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "day") < 60)
    return {
      count:
        dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "day") + 1,
      type: "day"
    }

  if (dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "week") < 24)
    return {
      count:
        dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "week") +
        1,
      type: "week"
    }
  if (
    dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "month") < 24
  )
    return {
      count:
        dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "month") +
        1,
      type: "month"
    }
  if (dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "year") < 12)
    return {
      count:
        dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "year") +
        1,
      type: "year"
    }
  return {
    count:
      dayjs(lastTask.value.dueAt).diff(earliestTask.value.startAt, "day") + 1,
    type: "day"
  }
})

// This function takes in a projectId, resourceId, and taskId, and posts it to
// the add-resource API to add the resource to the task then closes the add resource
// drop-down and adds the resource to the task
const addResource = (taskId, resourceId) => {
  axios
    .post("/api/add-resource", {
      id: currentProject.value.id,
      resourceId,
      taskId
    })
    .then((res) => {
      currentProject.value.tasks[
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find((task) => task.id === taskId)
        )
      ].resources.push(res.data.association)
      typeOpen.value = -1
      addOpen.value = -1
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}

// Remove a resource from a task, this function takes the resourceId, associationId, and projectId
// and posts it to the remove-resource API, then it removes the resource from the task
const removeResource = (resourceId, associationId, taskId) => {
  axios
    .post("/api/remove-resource", {
      id: currentProject.value.id,
      resourceId,
      associationId
    })
    .then(() => {
      currentProject.value.tasks[
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find((task) => task.id === taskId)
        )
      ].resources = currentProject.value.tasks[
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find((task) => task.id === taskId)
        )
      ].resources.filter((resource) => resource.id !== associationId)
      typeOpen.value = -1
      addOpen.value = -1
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}

const deleteTask = () => {
  axios
    .post("/api/delete-task", {
      id: currentProject.value.id,
      taskId: editingTask.value.id
    })
    .then(() => {
      currentProject.value.tasks.splice(
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find(
            (task) => task.id === editingTask.value.id
          )
        ),
        1
      )
      editShown.value = false
      ganttEdit.value = false
      taskNameInput = ""
      taskDescriptionInput = ""
      taskIconInput = ""
      taskStartInput.value = ""
      taskEndInput.value = ""
      editingTask.value = {}
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}

const deleteResource = () => {
  axios
    .post("/api/delete-resource", {
      id: currentProject.value.id,
      resourceId: editingResource.value.id
    })
    .then(() => {
      currentProject.value.resources.splice(
        currentProject.value.resources.indexOf(
          currentProject.value.resources.find(
            (resource) => resource.id === editingResource.value.id
          )
        ),
        1
      )
      editResourceShown.value = false
      resourceNameInput = ""
      resourceDescriptionInput = ""
      resourceIconInput = ""
      editingResource.value = {}
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}

// This function is called by the Task-type drop-down menu, the function changes the type with the edit-task API,
// then updates it in the frontend and closes the drop-down
const changeType = (task, type) => {
  axios
    .patch("/api/edit-task", {
      id: task.id,
      projectId: currentProject.value.id,
      description: task.description,
      icon: task.icon,
      name: task.name,
      start: task.startAt,
      end: task.dueAt,
      type
    })
    .then((res) => {
      currentProject.value.tasks[
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find(
            (task) => task.id === res.data.task.id
          )
        )
      ] = res.data.task
      typeOpen.value = -1
      addOpen.value = -1
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}

// This function is called by the toggles, it takes the name of a type and toggles it
const toggle = (type) => {
  typeOpen.value = -1
  addOpen.value = -1
  if (type === "pending") {
    pendingTasks.value = !pendingTasks.value
    localStorage.setItem("pendingTasks", pendingTasks.value)
  } else if (type === "ongoing") {
    ongoingTasks.value = !ongoingTasks.value
    localStorage.setItem("ongoingTasks", ongoingTasks.value)
  } else if (type === "complete") {
    completedTasks.value = !completedTasks.value
    localStorage.setItem("completedTasks", completedTasks.value)
  } else if (type === "hidden") {
    hiddenTasks.value = !hiddenTasks.value
    localStorage.setItem("hiddenTasks", hiddenTasks.value)
  }
}

const ganttSave = (task) => {
  if (editType.value !== 0) {
    taskNameInput = task.name
  }
  if (editType.value !== 1) {
    taskDescriptionInput = task.description
  }
  if (editType.value !== 2) {
    taskIconInput = task.icon
  }
  if (editType.value !== 3) {
    taskStartInput.value = task.startAt
  }
  if (editType.value !== 4) {
    taskEndInput.value = task.dueAt
  }
  editingTask.value.id = task.id
  editTask()
}

// This function is for editing tasks, it takes in the variables from the inputs and validates them
// before sending the edited details and the projectId and taskId to the edit-task API
const editTask = () => {
  let start
  let end

  // Check if the start date is a valid date and time
  if (taskStartInput.value?.trim()) {
    if (!dayjs(taskStartInput.value.trim()).isValid()) {
      store.error = "Invalid date"
      setTimeout(store.errorFalse, 5000)
      return
    }
    start =
      dayjs(
        taskStartInput.value
          .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
          .replace(/\bof\b/gi, "")
          .trim()
      ).toISOString() || Date.now()
  }

  // Check if the end date is a valid date and time
  if (taskEndInput.value?.trim()) {
    if (!dayjs(taskEndInput.value.trim()).isValid()) {
      store.error = "Invalid date"
      setTimeout(store.errorFalse, 5000)
      return
    }
    end = dayjs(
      taskEndInput.value
        .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
        .replace(/\bof\b/gi, "")
        .trim()
    ).toISOString()
  }

  // Check if the right menu is open before executing the function
  if (
    (editShown.value || ganttEdit.value !== -1) &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !createShown.value
  )
    axios
      .patch("/api/edit-task", {
        id: editingTask.value.id,
        projectId: currentProject.value.id,
        description: taskDescriptionInput,
        icon: taskIconInput,
        name: taskNameInput,
        start,
        end
      })
      .then((res) => {
        // Update the frontend and close the menu
        if (!res.data.task.resources) {
          res.data.task.resources = []
        }
        currentProject.value.tasks[
          currentProject.value.tasks.indexOf(
            currentProject.value.tasks.find(
              (task) => task.id === res.data.task.id
            )
          )
        ] = res.data.task
        editShown.value = false
        ganttEdit.value = false
        taskNameInput = ""
        taskDescriptionInput = ""
        taskIconInput = ""
        taskStartInput.value = ""
        taskEndInput.value = ""
        editingTask.value = {}
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
}

// This function is for creating tasks, it takes in the variables from the inputs and validates them
// before sending the new details and the projectId  to the create-task API
const createTask = (gantt) => {
  if (
    (createShown.value || gantt === true) &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !editShown.value
  ) {
    let start
    let end

    // Check if the start date is a valid date and time
    if (taskStartInput.value?.trim()) {
      if (!dayjs(taskStartInput.value.trim()).isValid()) {
        store.error = "Invalid date"
        setTimeout(store.errorFalse, 5000)
        return
      }
      start =
        dayjs(
          taskStartInput.value
            .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
            .replace(/\bof\b/gi, "")
            .trim()
        ).toISOString() || Date.now()
    }

    // Check if the end date is a valid date and time
    if (taskEndInput.value?.trim()) {
      if (!dayjs(taskEndInput.value.trim()).isValid()) {
        store.error = "Invalid date"
        setTimeout(store.errorFalse, 5000)
        return
      }
      end = dayjs(
        taskEndInput.value
          .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
          .replace(/\bof\b/gi, "")
          .trim()
      ).toISOString()
    }
    axios
      .post("/api/create-task", {
        id: currentProject.value.id,
        description: taskDescriptionInput,
        icon: taskIconInput,
        name: taskNameInput,
        start,
        end
      })
      .then((res) => {
        // Add the task to the tasks list and close the menu
        res.data.task.resources = []
        currentProject.value.tasks.push(res.data.task)
        createShown.value = false
        ganttEdit.value = false
        taskNameInput = ""
        taskDescriptionInput = ""
        taskIconInput = ""
        taskStartInput.value = ""
        taskEndInput.value = ""
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
  }
}

// This function is for editing tasks, it takes in the variables from the inputs and validates them
// before sending the edited details and the projectId to the edit-resource API then closes the menu
const editResource = () => {
  // Check if the right menu is open before executing the function
  if (
    editResourceShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !createResourceShown.value
  )
    axios
      .patch("/api/edit-resource", {
        id: editingResource.value.id,
        projectId: currentProject.value.id,
        description: resourceDescriptionInput,
        icon: resourceIconInput,
        name: resourceNameInput
      })
      .then((res) => {
        currentProject.value.resources[
          currentProject.value.resources.indexOf(
            currentProject.value.resources.find(
              (task) => task.id === res.data.resource.id
            )
          )
        ] = res.data.resource
        editResourceShown.value = false
        resourceNameInput = ""
        resourceDescriptionInput = ""
        resourceIconInput = ""
        editingResource.value = {}
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
}

// This function is for creating tasks, it takes in the variables from the inputs and validates them
// before sending the new details and the projectId to the create-resource API then closes the menu
const createResource = () => {
  // Check if the right menu is open before executing the function
  if (
    createResourceShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !editResourceShown.value
  )
    axios
      .post("/api/create-resource", {
        id: currentProject.value.id,
        description: resourceDescriptionInput,
        icon: resourceIconInput,
        name: resourceNameInput
      })
      .then((res) => {
        currentProject.value.resources.push(res.data.resource)
        createResourceShown.value = false
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
}

// This function returns the formatted date, it takes a given date and a variable to see
// if it's an end date or a start date, then returns the formatted date
const displayTime = (date, end) => {
  if (!date) return "No due date"
  const hoursDifference = dayjs(date).diff(dayjs(), "hour")
  if (dayjs(date) > dayjs()) {
    if (hoursDifference > 24) {
      if (end) {
        return `Ends on ${dayjs(date).format("MM/DD/YYYY")}`
      } else {
        return `Starts on ${dayjs(date).format("MM/DD/YYYY")}`
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
    return `Task started on ${dayjs(date).format("MM/DD/YYYY")}`
  }
}

// This function takes in the project's task and generates a pie chart which is then rendered in the UI,
// the function is executed when the user changes to the charts page
const drawPieChart = () => {
  // Create the canvas
  const canvas = document.querySelector("canvas")
  const ctx = canvas.getContext("2d")
  const colours = ["#181818", "#32CD32", "#ffd707", "#0190ea"]

  // Count the tasks

  const counts = [0, 1, 2, 3].reduce((acc, type) => {
    acc[type] = 0
    return acc
  }, {})

  currentProject.value.tasks.forEach((task) => {
    if (counts.hasOwnProperty(task.type)) {
      counts[task.type] += 1
    }
  })

  const data = [0, 1, 2, 3].map((type) => counts[type])
  const total = data.reduce((acc, val) => acc + val, 0)

  if (total === 0) {
    // Clear the canvas and display a message or graphic indicating no data
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = "20px Arial"
    ctx.fillStyle = "#000"
    ctx.textAlign = "center"
    ctx.fillText("No data available", canvas.width / 2, canvas.height / 2)
    return
  }

  // Starts the drawing on the canvas

  const canvasSize = Math.min(canvas.width, canvas.height)
  const padding = 20
  const radius = canvasSize / 2 - padding
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2

  let startAngle = 0

  // Draw each slice of the pie chart
  data.forEach((value, index) => {
    const sliceAngle = (value / total) * 2 * Math.PI
    const endAngle = startAngle + sliceAngle

    // Draw the slice
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = colours[index]
    ctx.fill()

    // Draw the slice border
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.lineWidth = 2
    ctx.strokeStyle = "#fff"
    ctx.stroke()
    if (data.filter((x) => x > 0).length !== 1) {
      // Draw the inside separator lines
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + radius * Math.cos(startAngle),
        centerY + radius * Math.sin(startAngle)
      )
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(
        centerX + radius * Math.cos(endAngle),
        centerY + radius * Math.sin(endAngle)
      )
      ctx.lineWidth = 2
      ctx.strokeStyle = "#fff"
      ctx.stroke()
    }

    startAngle = endAngle
  })
}

// Get project's data when the page loads based on the id in the route params (URL)
async function getProject(id) {
  await axios
    .get(`/api/project/${id}`)
    .then((res) => {
      currentProject.value = res.data.project
      loadingProject.value = false
    })
    .catch((e) => {
      if (e.response?.status === 400 || e.response?.status === 401) {
        router.push("/projects")
      } else {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      }
    })
}

// onMounted is a Vue function that executes when the page loads
onMounted(async () => {
  await getProject(route.params.id)
})
</script>

import { defineStore } from "pinia"

import { ref } from "vue"

export const useDataStore = defineStore("store", () => {
  const error = ref("")

  const errorFalse = () => {
    error.value = ""
  }

  return { error, errorFalse }
})

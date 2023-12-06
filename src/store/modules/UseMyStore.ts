import { defineStore } from 'pinia'

interface UseMyStoreState {
    count: number
}
export const UseMyStore = defineStore('useMyStore',{
  state: ():UseMyStoreState => ({
    count: 0
  }),
  actions: {
    increment() {
      this.count++
    }
  }
})

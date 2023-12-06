<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
const locale = ref(zhCN)
defineOptions({
  name: 'App'
})
</script>

<template>
  <a-config-provider
      :locale="locale"
      :theme="{
      token: {
        colorPrimary: '#fff',
      },
      components: {
        Modal: {
        },
        Select: {
        },
        Switch: {
        },
        Popover: {},
        Button: {
        },
        Transfer: {},
        Dropdown: {
        },
        Radio: {
        },
        Checkbox: {
        },
        Cascader: {
        },
        Drawer: {}
      }
    }"
  >
    <a-style-provider hash-priority="high">
      <router-view></router-view>
    </a-style-provider>
  </a-config-provider>

</template>

<style>

</style>

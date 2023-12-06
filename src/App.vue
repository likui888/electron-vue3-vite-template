<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import {ref} from "vue";
import {SerialPort} from "serialport";
const hid = require('node-hid')
const locale = ref(zhCN)
defineOptions({
  name: 'App'
})
console.warn("hids ==>",hid.devices());
SerialPort.list().then((ports) => {
  console.warn("usbs ==>",ports);
});
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

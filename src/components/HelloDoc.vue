<script setup lang="ts">
import {UseMyStore} from "@/store/modules/UseMyStore";

defineOptions({
  name: 'HelloDoc'
})
</script>

<template>
<div>
  <p>
    HelloDoc count is
    <a-badge :count="UseMyStore().count" class="ml-1">
      <a-avatar shape="square" size="large" />
    </a-badge>
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
  <div class="flex-center">
    Place static files into the <code>/public</code> folder
    <img style="width: 2.4em; margin-left: .4em;" src="/logo.svg" alt="Logo">
  </div>
</div>
</template>

<style scoped lang="less">
.read-the-docs {
  color: #888;
}
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}


</style>
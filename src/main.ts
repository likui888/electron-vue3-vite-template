import { createApp } from 'vue'
import "./style.css"
import App from './App.vue'
import './samples/node-api'
import 'uno.css'
import Antd from 'ant-design-vue'
import * as Pinia from 'pinia'
import router from "@/router";

const setUpAll = async () => {
    const app = createApp(App)
    //  全局状态管理
    app.use(Pinia.createPinia())
    // 脚手架
    app.use(Antd)
    // vue router
    app.use(router)
    await app.mount('#app') .$nextTick(() => {
            postMessage({payload: 'removeLoading'}, '*')
        })
    return {
        app,
        Pinia
    }
}
setUpAll()

import { rmSync } from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { notBundle } from 'vite-plugin-electron/plugin'
import pkg from './package.json'
import {presetMini} from "unocss";
import Unocss from 'unocss/vite'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import {AntDesignVueResolver,VueUseComponentsResolver} from "unplugin-vue-components/resolvers";
import Components from 'unplugin-vue-components/vite'
import VueDevTools from 'vite-plugin-vue-devtools'
// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true })

  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG

  return {
    define:{
      // 版本号
      __PACKAGE_VERSION__ : JSON.stringify(pkg.version),
    },
    plugins: [
      // https://github.com/antfu/unocss 便捷 class 定义
      Unocss({
        presets: [
          presetMini(),
        ],
      }),
      // 调试工具
      VueDevTools(),
      vue(),
      electron([
        {
          // Main process entry file of the Electron App. 主进程配置
          entry: 'electron/main/index.ts',
          onstart({ startup }) {
            if (process.env.VSCODE_DEBUG) {
              console.log(/* For `.vscode/.debug.script.mjs` */'[startup] Electron App')
            } else {
              startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                // Some third-party Node.js libraries may not be built correctly by Vite, especially `C/C++` addons, 
                // we can use `external` to exclude them to ensure they work correctly.
                // Others need to put them in `dependencies` to ensure they are collected into `app.asar` after the app is built.
                // Of course, this is not absolute, just this way is relatively simple. :)
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
            plugins: [
              // This is just an option to improve build performance, it's non-deterministic!
              // e.g. `import log from 'electron-log'` -> `const log = require('electron-log')` 
              isServe && notBundle(),
            ],
          },
        },
        {
          entry: 'electron/preload/index.ts', // 渲染进程配置
          onstart({ reload }) {
            // Notify the Renderer process to reload the page when the Preload scripts build is complete, 
            // instead of restarting the entire Electron App.
            reload()
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {}),
              },
            },
            plugins: [
              isServe && notBundle(),
            ],
          },
        }
      ]),
      // Use Node.js API in the Renderer process
      renderer({
        resolve:{
          serialport: { type: 'cjs' },
          got: { type: 'esm' },
        }
      }),
      // 自动导包
      AutoImport({
        dts: 'src/types/auto-imports.d.ts',
        imports: ['vue', 'vue-router','@vueuse/core',{
        }],
        resolvers: [
          AntDesignVueResolver(),
          VueUseComponentsResolver(),
        ],
        vueTemplate: true,
      }),
      // https://github.com/antfu/unplugin-vue-components
      Components({
        // 生成自定义 `auto-components.d.ts` 全局声明
        dts: 'src/types/auto-components.d.ts',
        // 自定义组件的解析器
        resolvers: [],
        globs: ["src/components/**/**.{vue, md}"]
      }),
    ],
    server: process.env.VSCODE_DEBUG && (() => {
      const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
      return {
        host: url.hostname,
        port: +url.port,
      }
    })(),
    resolve:{
      // 别名
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
      }
    },
    css: {
      preprocessorOptions: {
        less:{
          javascriptEnabled: true
        }
      }
    },
    clearScreen: false,
  }
})

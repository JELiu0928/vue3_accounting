import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), vueJsx(), vueDevTools()],
	resolve: {
        alias:{
            "@":path.join(__dirname,"./src")
        }
	},
	server: {
		hmr: true, // 確保開啟 HMR
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `@import "@/assets/scss/main.scss";`,
			},
		},
	},
	base: '/vue3_accounting/',
})

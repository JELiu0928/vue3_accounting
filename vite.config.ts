import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'node:path'

// 按需引入 Element Plus 所需
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), vueJsx(), vueDevTools(),
        // 按需引入 Element Plus 所需
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
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

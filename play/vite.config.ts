import path from 'path'
import url from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Inspect from 'vite-plugin-inspect'
import mkcert from 'vite-plugin-mkcert'
import { glob } from 'tinyglobby'

const elementPlusRoot = url.resolve(
  import.meta.resolve('element-plus/package.json'),
  '.'
)
const getSubPackageRoot = (name: string) => {
  return url.resolve(
    import.meta.resolve(`@element-plus/${name}/package.json`, elementPlusRoot),
    '.'
  )
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    css: {
      preprocessorOptions: {
        scss: {
          // additionalData: `@use "/styles/custom.scss" as *;`,
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    resolve: {
      alias: [
        {
          find: /^element-plus$/,
          replacement: url.resolve(elementPlusRoot, 'index.ts'),
        },
        {
          find: /^element-plus\/(?:es\/|lib\/)?([^/]+)\/(.+)$/,
          // replacement is typed as a string only, but actually a function works too.
          replacement: ((_: string, name: string, rest: string) => {
            return url.resolve(getSubPackageRoot(name), rest)
          }) as unknown as string,
        },
      ],
    },
    server: {
      port: 3000,
      host: true,
      https: !!env.HTTPS ? {} : false,
    },
    build: {
      sourcemap: true,
    },
    plugins: [
      vue(),
      vueJsx(),
      Components({
        include: `${__dirname}/**`,
        resolvers: ElementPlusResolver({
          version: '2.0.0-dev.1',
          importStyle: 'sass',
        }),
        dts: false,
      }),
      mkcert(),
      Inspect(),
    ],

    esbuild: {
      target: 'chrome64',
    },
  }
})

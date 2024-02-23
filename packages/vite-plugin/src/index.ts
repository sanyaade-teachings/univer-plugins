import { handleCSS, handleLocales, virtualLocalesModuleId } from '@univerjs/plugin-core'

export interface UniverPluginOptions {
  css?: boolean
}

export function univerPlugin(pluginOptions?: UniverPluginOptions) {
  const { css = true } = pluginOptions ?? {}

  const virtualModuleNamespace = `\0${virtualLocalesModuleId}`

  return {
    name: 'univer-plugin',

    resolveId(id) {
      if (id === virtualLocalesModuleId) {
        return virtualModuleNamespace
      }
    },

    async load(id) {
      /**
       * generate a virtual module that exports all the locales from `@univerjs` and `@univerjs-pro`
       */
      if (id === virtualModuleNamespace) {
        const code = handleLocales()

        return code
      }
    },

    transform(code, id) {
      /**
       * auto inject css
       * 1. find all import statements that import from @univerjs and @univerjs-pro
       * 2. check if the package has a CSS file
       * 3. if the package has a CSS file, inject the import statement to the top of the file
       * 4. remove the import statement from the original file
       * 5. return the modified code
       */
      if (css) {
        // check if the current file being processed is a JavaScript or TypeScript file
        if (!/\.tsx?$|\.jsx?$/.test(id)) return

        const cssImports = handleCSS(code)

        // extract the CSS import statements from the code
        if (cssImports) {
          return {
            code: cssImports + code,
            map: null,
          }
        }
      }
    },
  }
}

import {makeConfigParts, Envs} from '../commons'
import {default as immer, setAutoFreeze} from 'immer'
// import * as CircularDependencyDetector from 'circular-dependency-plugin'

setAutoFreeze(false)

module.exports = (env: Envs) => {
  const parts = makeConfigParts({
    env,
    withReactHotLoading: true,
    packageName: 'studio',
    withDevServer: true,
    entries: {
      index: ['./src/studio/index.tsx'],
    },
  })

  return immer(parts.config, c => {
    c.output.libraryTarget = 'umd'
    c.output.library = 'TheatreJS'

    c.plugins.push(
      /**
       * Enable this if you suspect an error is caused by circular dependencies.
       * Note that we do have a bunch of circular dependencies that don't cause
       * any trouble
       */
      // new CircularDependencyDetector({
      //   cwd: parts.srcDir,
      //   exclude: /\/node_modules\/|\/DataVerse\//,
      // })
    )
  })
}

import { init } from '@rematch/core'
import immerPlugin from '@rematch/immer'

function createModel(models, options = {}){
  const {
    plugins: optionsPlugins = [],
    immer = true,
    ...mergeOptions
  } = options
  
  const plugins = [...optionsPlugins]
  
  if(immer){
    plugins.push(immerPlugin)
  }
  
  return init({
    models,
    plugins,
    ...mergeOptions,
  })
}

export default createModel

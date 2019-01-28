import { init } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import selectPlugin from '@rematch/select'

function createModel(models, options = {}){
  const {
    plugins: optionsPlugins = [],
    immer = true,
    select = true,
    ...mergeOptions
  } = options
  
  const plugins = [...optionsPlugins]
  
  if(immer){
    plugins.push(immerPlugin)
  }
  if(select){
    plugins.push(selectPlugin())
  }
  
  return init({
    models,
    plugins,
    ...mergeOptions,
  })
}

export default createModel

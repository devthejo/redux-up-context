import { init } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import selectPlugin from '@rematch/select'

function createModel(models, options = {}){
  const {
    plugins: optionsPlugins = [],
    immer = true,
    select = true,
    multi = true,
    key = 'model',
    ...mergeOptions
  } = options
  
  const plugins = [...optionsPlugins]
  
  if(immer){
    plugins.push(immerPlugin)
  }
  if(select){
    plugins.push(selectPlugin())
  }
  
  if(!multi){
    const {
      reducers,
      effects,
      selectors,
    } = models
    
    const localEffetcs = function(dispatch){
      const effectsMap = effects(dispatch[key])
      return Object.entries(effectsMap).reduce(o, ([key, effect])=>{
        o[key] = function(payload, rootState){
          return effect(payload, rootState[key])
        }
        return o
      }, {})
    }
    
    const localSelectors = Object.entries(selectors).reduce(o, ([key, selector])=>{
      o[key] = function(){
        return function(rootState, props){
          selector(rootState[key], props)
        }
      }
      return o
    }, {})
    
    models = {
      [key]: {
        reducers,
        effetcs: localEffetcs,
        selectors: localSelectors,
      }
    }
  }
  
  return init({
    models,
    plugins,
    ...mergeOptions,
  })
}

export default createModel

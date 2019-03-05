import { init } from '@rematch/core'
import immerPlugin from '@rematch/immer'
import selectPlugin from '@rematch/select'
import defaultOptions from './defaultOptions'

function createModel(models, options = {}){
  options = {...defaultOptions, ...options}
  const {
    plugins: optionsPlugins,
    immer,
    select,
    multi,
    key,
    ...mergeOptions
  } = options

  const plugins = [...optionsPlugins]

  if(immer){
    plugins.push(immerPlugin())
  }
  if(select){
    plugins.push(selectPlugin())
  }

  if(!multi){
    const {
      state,
      reducers,
      effects,
      selectors,
    } = models

    function getLocalSelectors(selectors={}){
      return Object.entries(selectors).reduce((o, [selectorKey, selector])=>{
        o[selectorKey] = function(){
          return function(rootState, props){
            return selector()(rootState[key], props)
          }
        }
        return o
      }, {})
    }

    const localEffetcs = function(dispatch){
      const effectsMap = effects(dispatch[key])
      return Object.entries(effectsMap).reduce((o, [effectKey, effect])=>{
        o[effectKey] = function(payload, rootState){
          return effect(payload, rootState[key])
        }
        return o
      }, {})
    }

    let localSelectors
    if(typeof selectors === 'function'){
      localSelectors = (slice, createSelector, hasProps)=>{
        return getLocalSelectors(selectors(slice, createSelector, hasProps))
      }
    }
    else{
      localSelectors = getLocalSelectors(selectors)
    }

    models = {
      [key]: {
        state,
        reducers,
        effects: localEffetcs,
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

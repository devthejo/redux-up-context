import React, {createContext} from 'react'
import deepmerge from 'deepmerge'

import { Provider, connect } from 'react-redux'

import useModel from './useModel'
import createModel from './createModel'

import { useContextStore, useContextAction } from '@redux-up/hooks'

function mergeRuntime(callFunc, defaultModel = {}, defaultOptions = {}){
  return function(model = {}, options = {}){
    if(typeof model==='function'){
      model = model(defaultModel)
    }
    else{
      if(typeof defaultModel==='function'){
        defaultModel = defaultModel()
      }
      model = deepmerge(defaultModel, model)
    }
    if(typeof options==='function'){
      options = options(defaultOptions)
    }
    else{
      if(typeof defaultOptions==='function'){
        defaultOptions = defaultOptions()
      }
      options = deepmerge(defaultOptions, options)
    }
    return callFunc(model, options)
  }
}


function createContextModel(model, options){
  const context = createContext()
  return {
    context,
    get connect(mapStateToProps, mapDispatchToProps, mergeProps, options = {}){
      options = {
        context,
        ...options
      }
      return connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
    },
    get createModel(){
      return mergeRuntime(createModel, model, options)
    }, //class constructor component
    get useModel() {
      return mergeRuntime(useModel, model, options)
    }, //hook for function component
    Provider: ({store, children}) => <Provider context={context} store={store} children={children} />,
    useStore: mapState => useContextStore(context, mapState),
    useAction: mapActions => useContextAction(context, mapActions),
  }
}

export default createContextModel

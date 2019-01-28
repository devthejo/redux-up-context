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
  let createModel, useModel, reactReduxConnect
  return {
    context,
    get createModel(){
      if(createModel===undefined)
        createModel = mergeRuntime(createModel, model, options)
      return createModel
    }, //class constructor component
    get useModel() {
      if(useModel===undefined)
        useModel = mergeRuntime(useModel, model, options)
      return useModel
    }, //hook for function component
    Provider: ({store, children}) => <Provider context={context} store={store} children={children} />,
    useStore: mapState => useContextStore(context, mapState),
    useAction: mapActions => useContextAction(context, mapActions),
    get connect(){
      if(!reactReduxConnect)
        reactReduxConnect = function(mapStateToProps, mapDispatchToProps, mergeProps, options){
          options = {
            context,
            ...options
          }
          return connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
        }
      return reactReduxConnect
    },
  }
}

export default createContextModel

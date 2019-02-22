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

  const {
    multi = true,
    key = 'model',
  } = options

  let
    contextCreateModel,
    contextUseModel,
    contextConnect,
    contextStore,
    contextConnectSelectors,
    contextUseSelectors

  let useStore,
      useAction,
      select

  if(multi){
    useStore = mapState => useContextStore(context, mapState)
    useAction = mapActions => useContextAction(context, mapActions)
    select = () => contextStore.select
  }
  else{
    useStore = mapState => useContextStore(context, state => mapState(state[key]))
    useAction = mapActions => useContextAction(context, dispatch => mapActions(dispatch[key]))
    select = () => contextStore.select[key]
  }

  const contextApi = {
    context,
    get createModel(){
      if(contextCreateModel===undefined)
        contextCreateModel = mergeRuntime(createModel, model, options)
      return contextCreateModel
    }, //class constructor component
    get useModel() {
      if(contextUseModel===undefined)
        contextUseModel = mergeRuntime(useModel, model, options)
      return contextUseModel
    }, //hook for function component
    Provider: ({store, children}) => {
      contextStore = store
      return <Provider context={context} store={store} children={children} />
    },
    useStore,
    useAction,
    get connect(){
      if(!contextConnect){
        if(multi){
          contextConnect = function(mapStateToProps, mapDispatchToProps, mergeProps, options = {}){
            options = {context, ...options}
            return connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
          }
        }
        else{
          contextConnect = function(mapStateToProps, mapDispatchToProps, mergeProps, options = {}){
            options = {context, ...options}
            return connect(state => mapStateToProps(state[key]), dispatch => mapDispatchToProps(dispatch[key]), mergeProps, options)
          }
        }
      }
      return contextConnect
    },
    get select(){
      return select()
    },

    get connectSelectors(){
      if(!contextConnectSelectors){
        if(multi){
          contextConnectSelectors = mapSelectors => contextApi.connect((state, props)=>contextStore.select(mapSelectors)(state, props))
        }
        else{
          contextConnectSelectors = mapSelectors => contextApi.connect((state, props)=>contextStore.select(mapSelectors)(state[key], props))
        }
      }
      return contextConnectSelectors
    },

    get useSelectors(){
      if(!contextUseSelectors){
        if(multi){
          contextUseSelectors = (mapSelectors, props={}) => contextStore.select(mapSelectors)(contextStore.getState(), props)
        }
        else{
          contextUseSelectors = (mapSelectors, props={}) => contextStore.select(mapSelectors)(contextStore.getState()[key], props)
        }
      }
      return contextUseSelectors
    },

  }

  return contextApi
}

export default createContextModel

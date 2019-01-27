import React, {createContext} from 'react'

import { Provider } from 'react-redux'

import useModel from './useModel'
import createModel from './createModel'

import { useContextStore, useContextAction } from '@redux-up/hooks'

function createContextModel(model, options){
  const context = createContext()
  return {
    context,
    createModel: ()=>createModel(model, options), //class constructor component
    useModel: ()=>useModel(model, options), //hook for function component
    Provider: ({store, children}) => <Provider context={context} store={store} children={children} />,
    useStore: mapState => useContextStore(context, mapState),
    useAction: mapActions => useContextAction(context, mapActions),
  }
}

export default createContextModel

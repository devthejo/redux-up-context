import { useState } from 'react'
import createModel from './createModel'

function useModel(models, options = {}){
  return useState(()=>createModel(models, options))
}

export default useModel

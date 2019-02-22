import createContextModel from './createContextModel'
export default function createContextModels(model, options = {}){
  options = {
    ...options,
    multi: false,
  }
  return createContextModel(model, options)
}
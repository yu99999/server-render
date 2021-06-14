import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import {clientAxios, serverAxios} from '../api'

const defalutState = {
  list: []
}

const reducer = (state = defalutState, action) => {
  switch(action.type){
    case 'change_list':
      return {
        ...state,
        list: action.list
      }
    default: 
      return state;
  }
}

export const getStore = () => {   // 服务端 store
  return createStore(reducer, applyMiddleware(thunk.withExtraArgument(serverAxios)))
}

export const getClientStore = () => {
  const defalutState = window.context.state   // 从数据注水中提取服务端渲染产生的 store
  return createStore(reducer, defalutState, applyMiddleware(thunk.withExtraArgument(clientAxios)))
}
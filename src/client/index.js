import React from 'react'
import ReactDom from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import {getClientStore} from '../store/index'
import routes from '../routes'
import { renderRoutes } from 'react-router-config'

const store = getClientStore();		// 获取客户端 store，当服务端有数据时，这里会有通过数据注水生成的默认 state

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div>
          {renderRoutes(routes)}
        </div>
      </BrowserRouter>
    </Provider>
  )
}

ReactDom.hydrate(<App />, document.getElementById('app'))
import React from 'react'
import {renderToString} from 'react-dom/server'
import {StaticRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import { renderRoutes } from 'react-router-config'
import routes from '../routes'

export const render = (store, req) => {
  
  const context = {
    css: []
  }

  const content = renderToString((
    // 服务端渲染要使用 StaticRouter
    <Provider store={store}>
      <StaticRouter context={context} location={req.path}>
        <div>
          {renderRoutes(routes)}
        </div>
      </StaticRouter>
    </Provider>
  ))

  return `
    <html>
      <head>
        <title>ssr</title>
        <style>${context.css.join('\n')}</style>
      </head>
      <body>
        <div id="app">${content}</div>
        <script>
          window.context = {state: ${JSON.stringify(store.getState())}}
        </script>
        <script src="./main.js"></script>
      </body>
    </html>
  `
}
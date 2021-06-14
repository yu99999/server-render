import React from 'react'
import Header from './contains/components/Header'
import {renderRoutes} from 'react-router-config'
import styles from './index.css'
import WithStyle from './WithStyle'

const App = (props) => {
  
  return (
    <div>
      <Header />
      {renderRoutes(props.route.routes)}
    </div>
  )
  
}

export default WithStyle(App, styles);
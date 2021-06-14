import React from 'react'
import styles from './login.css'
import WithStyle from '../WithStyle'

const Login = () => {
  const onClick = () => {
    console.log('login')
  }

  return (
    <div>
      <h1 className={styles.title}>login!!</h1>
      <button onClick={onClick}>按钮</button>
    </div>
  )
}

export default WithStyle(Login, styles)
import React from 'react'
import {Link} from 'react-router-dom'

export default (props) => {
  return (
    <div>
      <Link to="/">Home</Link>
      <br />
      <Link to="/login">login</Link>
    </div>
  )
}
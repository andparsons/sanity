import React from 'react'
import {Router, Route} from 'react-enroute'
import SelectType from './SelectType'
import Debug from 'debug'
import SchemaForm from './SchemaForm'
import styles from './styles/Main.css'

// Todo: figure out why it complains so much
// import {whyDidYouUpdate} from 'why-did-you-update'
// whyDidYouUpdate(React)

Debug.disable('*')
if (process.env.DEBUG) {
  Debug.enable(process.env.DEBUG)
}

export default function Main() {
  return (
    <div className={styles.root}>
      <Router location={document.location.pathname}>
        <Route path="/" component={SelectType} />
        <Route path="/:schemaName" component={SelectType} />
        <Route path="/:schemaName/:typeName" component={SchemaForm} />
      </Router>
    </div>
  )
}

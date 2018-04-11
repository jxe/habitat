import React from 'react';
import {
  Menu, MenuItem,
  Navbar, NavbarDivider, NavbarGroup,
  Popover, Button, ButtonGroup,
  Position, Alignment
} from "@blueprintjs/core";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import {ObjectInspector} from 'react-inspector'
import {Messages} from './Messages.jsx'
import {Editor} from './Editor.jsx'
import './styles.css'
import { view, store } from 'react-easy-state'
import { state } from './storage.js'
import Runtime from './runtime.js'

const fakeUsers = [{
  uid: 'joe',
  displayName: "Joe E",
  photoURL: "./joe.jpg"
}, {
  uid: 'julie',
  displayName: "Julie S",
  photoURL: "./julie.jpg"
}]

const config = store({
  user: fakeUsers[0],
  showing: 'chat',
  matchers: [],
  modals: []
})


const UsersMenu = view(() => {
  return <Popover content={
    <Menu> {
        fakeUsers.map(u => (
          <MenuItem onClick={() => config.user = u} text={u.displayName} key={u.uid} />
        ))
    } </Menu>
  } position={Position.RIGHT_TOP}>
    <Button icon="person" text={config.user.displayName} />
  </Popover>
})

// const MatchGroupsMenu = () => {
//   return <Popover content={
//       <Menu>
//         <MenuItem text="M1" />
//         <MenuItem text="M2" />
//       </Menu>
//     } position={Position.RIGHT_TOP}>
//       <Button text="Matches..." />
//   </Popover>
// }

const Toolbar = view(() => {
  let Toggle = view(({k, v, ...rest}) => (
    <Button {...rest} active={config[k] === v} onClick={()=> config[k] = v}/>
  ))

  return <Navbar className="Navbar">
    <NavbarGroup align={Alignment.LEFT}>
      <ButtonGroup>
        <Toggle icon="chat" text="Habitat" k="showing" v="chat"/>
        <Toggle icon="database" text="Data" k="showing" v="data"/>
      </ButtonGroup>
    </NavbarGroup>
    <NavbarGroup align={Alignment.RIGHT}>
      {/* <MatchGroupsMenu /> */}
      <NavbarDivider />    
      <UsersMenu />
    </NavbarGroup>
  </Navbar>
})

const Habitat = view(() => {
  let {modals, showing} = config
  let runtime = new Runtime(config.user.uid)
  if (modals[0]) return modals[0]
  let messages = runtime.posts().map(msg => {
    msg.expandedAuthors = fakeUsers.filter(u => u.uid === msg.author)
    msg.expandedAuthors[0].isMe = msg.author === config.user.uid
    return msg
  })
  return <div className="MessagesView Screen">
    <Toolbar />
    {showing === 'chat' && <div style={{display:"flex", flexDirection: "column", height: "100%"}}>
      <Messages runtime={runtime} msgs={messages} />
      <Editor runtime={runtime} />
    </div>}
    {showing === 'data' && <div style={{padding: "10px"}}>
      <ObjectInspector data={state} expandLevel={2} />
    </div>}
  </div>
})

export {Habitat}

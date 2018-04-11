import React from 'react';
import {
  Button
} from "@blueprintjs/core";
import { config as editorConfig } from './Editor.jsx'
import { match } from './storage.js'
import { view } from 'react-easy-state'
import {TableInspector} from 'react-inspector'

const Authors = ({expandedAuthors}) => (
  <div>{
    expandedAuthors.map(a => (
      <span key={a.uid}> <b>{a.displayName}</b> {a.role} </span>
    ))
  }</div>
)

const Attachments = ({attach}) => (
  <div className="Attachments">{
    Object.keys(attach).map(a => (
      <div className="Attachment">
        <b>{a}</b>
        <div>{attach[a]}</div>
      </div>
    ))  
  }</div>
)

const Queries = view(({which}) => (
  <div className="Attachments">{
    which.map(q => (
      <div className="Attachment">
        <b>{q.pattern.join(' ')}</b>
        <div>
          <TableInspector data={match(...q.pattern)} />
        </div>
        {/* <div>{JSON.stringify(match(...q.pattern))}</div> */}
      </div>
    ))  
  }</div>
))

const Message = view(({msg, runtime}) => {
  let expandedAuthors = msg.expandedAuthors || []
  let fromMe = expandedAuthors.some(x => x.isMe)
  let direction = fromMe ? "righty" : "lefty"
  let photoURL = expandedAuthors[0].photoURL
  return <div className={`MessageChrome ${direction}`}>
    <div className="row">
      <img className="avatar" src={photoURL} alt="" />
      <div>
        <div className="header">
          <Authors expandedAuthors={expandedAuthors} />
        </div>
        <div className="MessageBubble">
          <div className="Section"> {msg.text} </div>        
          {msg.attached && <Attachments attach={msg.attached} />}
          {msg.queries && msg.queries.length && <Queries which={msg.queries} />}
        </div>
      </div>
    </div>
    <Buttons {...msg} runtime={runtime} />
  </div>
})

const Messages = view(({msgs, runtime}) => (
  <div className="Messages" style={{flex:1}}>{
    Object.values(msgs).map(m => <Message key={m.id} msg={m} runtime={runtime} />)
  }</div>
))

const Buttons = view(({templates, toggles, runtime}) => {
  let buttons = []
  if (templates && templates.length){
    buttons.push(
      <Button minimal={true} onClick={()=>{
        editorConfig.draft = templates[0].matchedText
      }} text="reply"/>
    )
  }

  if (toggles && toggles.length){
    toggles.forEach(t => {
      let clicked = runtime.toggle(t)
      buttons.push(
        <Button minimal={true} icon={clicked ? 'confirm' : 'circle'} onClick={
          ()=>{ runtime.toggle(t, !clicked) }
        } text={t} />
      )
    })
  }

  if (!buttons || !Object.keys(buttons).length) return null
  return <div className="Buttons">{buttons}</div>
})

export {Messages}

import React from 'react';
import { view, store } from 'react-easy-state'
import { state, match, add } from './storage.js'
import { parse } from './parser.js'
import {
  ControlGroup, InputGroup, Button
} from "@blueprintjs/core";

const config = store({
  draft: "",
  attachments: {}
})

function reset(){
  config.draft = ""
  config.attachments = {}
}

const Editor = view(({runtime}) => {
  let {draft, attachments} = config
  let parsed = draft && parse(draft).value || {}
  let draftType = parsed.type
  let actionIcon = {
    when: "layers",
    text: "arrow-up"
  }[draftType]

  let AttachmentCollector = view(({k}) => (
    <Button text={k} rightIcon={attachments[k] && 'small-tick'} onClick={()=>{
      attachments[k] = prompt(k)
    }}/>)
  )

  return <div className="Editor">
    {parsed.attachments && <div className="Adder">
      Please add: {parsed.attachments.map(a => <AttachmentCollector k={a.key}/>)}
    </div>}

    <form onSubmit={
      ev => {
        ev.preventDefault()
        if (!draftType) return
        runtime.post(parsed, attachments)
        reset()
      }
    }>
      <ControlGroup fill={true} large={true}>
          <InputGroup value={draft} placeholder="Type a message..." onChange={ev => config.draft = ev.target.value} />
          <Button icon={actionIcon} type="submit" style={{maxWidth: '40px'}}/>
      </ControlGroup>
    </form>
  </div>
})

export { Editor, config }

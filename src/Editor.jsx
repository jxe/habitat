import React from 'react';
import { view, store } from 'react-easy-state'
import { parse } from './parser.js'
import { InputGroup, Button } from "@blueprintjs/core";

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
  let parsed = (draft && parse(draft).value) || {}
  let draftType = parsed.type
  let actionIcon = {
    when: "time",
    text: "arrow-up",
    group: "people"
  }[draftType]
  let ready = draftType && (!parsed.attachments || parsed.attachments.every(a => 
    attachments[a.key]
  ))

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
        if (!ready) return
        runtime.post(parsed, attachments)
        reset()
      }
    }>
      <InputGroup
        round={true}
        large={true}
        value={draft}
        placeholder="Type a message..."
        rightElement={
          <Button
            minimal={true}
            icon={actionIcon}
            type="submit"
            />
        }
        onChange={ev => config.draft = ev.target.value}
      />
    </form>
  </div>
})

export { Editor, config }

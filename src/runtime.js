import { state, match, add } from './storage.js'
import { parse } from './parser.js'

export default class Runtime {

  constructor(uid){
    this.uid = uid
  }

  post(parsed, attachments, uid){
    if (!uid) uid = this.uid
    if (parsed.type == 'text'){
      parsed.attached = attachments
      add(`${uid}/posts/(+)`, parsed)
      add(`${uid}/data`, attachments)
      this.check()
    } else if (parsed.type == 'when') {
      add(`${uid}/when/(+)`, parsed)
    }
  }
  
  // BUG: toggling one thing probably untoggles everything else by that user
  toggle(t, value){
    let path = `${this.uid}/clicked`
    if (value !== undefined){
      add(path, {[t]: value})
      this.check()
    } else {
      let status = match(`${path}/...`)
      return status[0] && status[0]["..."] && status[0]["..."][t]  
    }
  }
  
  posts(){
    return match('$x/posts/$id/...').map(o => {
      let msg = Object.assign({}, o['...'])
      msg.id = o['$id']
      msg.author = o['$x']
      return msg
    })
  }

  conditionals(){
    return match('$x/when/$id/...').map(o => {
      let cond = Object.assign({}, o['...'])
      cond.id = o['$id']
      cond.author = o['$x']
      return cond
    }) 
  }
  
  check(){
    let did = state['did'] || {}
    this.conditionals().forEach(cond => {
      match(...cond.query.pattern).forEach(m => {
        let json = JSON.stringify(m)
        if (!did[cond.id] || !did[cond.id][json]){
          console.log(cond.id, json, did[cond.id])
          // debugger;
          add(`did/${cond.id}/${json}`)
          let text = cond.text.matchedText
          Object.keys(m).forEach(k => {
            text = text.replace(k, m[k])
          })
          let parsed = parse(text).value
          parsed && this.post(parsed, null, cond.author)
        }
      })
    })
  }
  
}

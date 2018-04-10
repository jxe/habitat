import { view, store } from 'react-easy-state'

const state = store({})
const subs = []

function sub(paths, fn){
  let s = [paths, fn]
  subs.push(s)
  fn(match(paths))
  return s
}
function runSubs(){
  subs.forEach(([paths, fn])=> fn(match(paths)))
}
function drill(components){
  let ptr = state
  components.forEach(component => {
    if (!ptr[component]) ptr[component] = {}
    ptr = ptr[component]
  })
  return ptr
}
function upgradingSet(ptr, k, v){
  let ov = ptr[k]
  if (!ov || typeof v == 'object'){
    // ptr = {a:1}, k = 'b', v = 'a'
    ptr[k] = v
  } else if (typeof ov == 'object'){
    // ptr = {a:{b:1}}, k = 'a', v = 'd'
    ptr[k][v] = true      
  } else {
    // ptr = {a:1}, k = 'a', v = 2
    ptr[k] = { [ov]: true, [v]: true }
  }
}
function add(path, v){
  path = path.replace('(+)', Date.now())
  let components = path.split('/')
  let k = components.pop()
  if (!v){ v = k; k = components.pop() }
  upgradingSet(drill(components), k, v)
  runSubs()
}
function matches(path){
  return _matches(state, path.split('/'), {})
}
function match(...paths){
  return paths.reduce(
    (ms, path) => {
      return ms.map(m => {
        let mPath = path
        Object.keys(m).forEach(k => {
          mPath = mPath.replace(k, m[k])
        })
        return matches(mPath).map(r => Object.assign(r, m))
      }).reduce((p,c) => p.concat(c))
    }, [{}]
  )
}
function immediateMatches(pattern, tree){
  if (pattern == tree) return [{}]
  if (tree[pattern] === true) return [{}]
  if (pattern == '...') return [{[pattern]:tree}]
  if (pattern[0] == '$'){
    if (typeof tree !== "object") return [{[pattern]:tree}]
    else return Object.keys(tree).filter(k => tree[k] === true).map(k => ({[pattern]: k}))      
  }
  return []
}
function _matches(tree, components, matched){
  let [first, ...rest] = components
  if (rest.length == 0){
    return immediateMatches(first, tree).map( i => Object.assign(i, matched))
  } else {
    if (first[0] == '$'){
      let results = []
      Object.keys(tree).forEach(k => {
        let ms = _matches(
          tree[k], 
          components.slice(1),
          Object.assign({[first]:k}, matched)
        )
        results = results.concat(ms)
      })
      return results
    } else if (tree[first]){
      return _matches( tree[first], components.slice(1), matched )
    } else return []
  }
}

export {sub, add, match, state}


// add('foo/bar/baz')
// add('foo/bar/bing')
// console.log(
//   matches('foo/bar/$x')
// )
// console.log(
//   matches('$x/bar/$y')
// )

// add('joe/likes/margaux')
// add('margaux/likes/joe')
// add('joe/likes/kathi')


// console.log(
//   matches('$x/likes/$y')
// )


// console.log(
//   'mutuals',
//   match('$x/likes/$y', '$y/likes/$x')
// )

// console.log(
//   match('$x/likes/joe')
// )

// debugger;

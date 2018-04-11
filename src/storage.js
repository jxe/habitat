import { store } from 'react-easy-state'
const state = store({})

// note: add semantics are weird because
// this is both a json and a tuple store
//
// if we start with {a:{b:1}}...
//
// add('b', 'v') => {a:{b:1},b:"v"} (case 1)
// add('b/v')    => same
// add('a', 'd') => {a:{b:1, d:true}} (case 2)
// add('a/d')    => same
// add('a/b', 'd') => {a:{b:{"1":true,d:true}}} (case 3)
// add('a/b/d')    => same

function matchLeaf(first, tree){
  if (first === tree || tree[first] === true) return [{}]
  if (first === '...') return [{[first]:tree}]
  if (first[0] === '$'){
    if (typeof tree !== "object") return [{[first]:tree}]
    else return Object.keys(tree).filter(k => tree[k] === true).map(k => ({[first]: k}))      
  }
  return []
}
function match1(tree, components, matched){
  let [first, ...rest] = components
  if (rest.length === 0){
    return matchLeaf(first, tree).map( i => Object.assign(i, matched))
  } else {
    if (first[0] === '$'){
      return Object.keys(tree).reduce(
        (results, k) => results.concat(
          match1(
            tree[k], 
            components.slice(1),
            Object.assign({[first]:k}, matched)
          )
        ),
        []
      )
    } else if (tree[first]){
      return match1( tree[first], components.slice(1), matched )
    } else return []
  }
}

function substitute(path, m){
  return Object.keys(m).reduce(
    (mPath, k) => mPath.replace(k, m[k]),
    path
  )
}


// the stuff

function add(path, v){
  path = path.replace('(+)', Date.now())
  let components = path.split('/')
  let k = components.pop()
  if (!v){ v = k; k = components.pop() }
  let ptr = components.reduce(
    (o, component) => {
      if (!o[component]) o[component] = {}
      return o[component]
    },
    state
  )
  let ov = ptr[k]
  if (!ov || typeof v === 'object'){   // case 1
    ptr[k] = v
  } else if (typeof ov === 'object'){  // case 2
    ptr[k][v] = true      
  } else {                             // case 3
    ptr[k] = { [ov]: true, [v]: true }
  }
}

function match(...paths){
  return paths.reduce(
    (ms, path) => ms.map(
      m => match1( state, substitute(path, m).split('/'), {} ).map(
        r => Object.assign(r, m)
      )
    ).reduce( (p,c) => p.concat(c) ),
    [{}]
  )
}

export {add, match, state}


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

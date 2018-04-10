import Parsimmon, { string, regexp, seqObj, alt, lazy, seq, lookahead } from 'parsimmon'
// const Parsimmon = require('parsimmon')
// const { string, regexp, seqObj, alt, lazy, seq } = Parsimmon

//////////
// atoms

let parenthesized = inner => inner.wrap(string('('), string(')')),
        bracketed = inner => inner.wrap(string('{'), string('}'))
let   ident = regexp(/[a-z][A-Za-z0-9]*/), // person1287f
         ws = regexp(/[ \t]+/),
        ows = regexp(/[ \t]*/),
  plainText = regexp(/[^\n{}()@#✏️📎☑️]+/)


//////////
// message text can contain:
// {}, @, #, ✏️, 📎, ☑️, ☑️#, ☑️@, 📎favoritePhoto{*/data/photo}, 
// TODO: @@, ##

let variable = string("$").then(ident).node('variable')
let hashtag = string("#").then(ident).node('hashtag')
let mention = string("@").then(ident).node('mention')
let role = hashtag.or(mention)
let toggle = string("☑️").then(ident.or(role)).node('toggle')

let pathComponent = role.or(variable).or(ident)
let path = pathComponent.sepBy1(string('/')).thru(span)
let pattern = path.sepBy1(ws)
// let query = bracketed(pattern.trim(ows)).node('query')
let query = bracketed(pattern.trim(ows)).map(p => ({name: 'query', pattern: p}))

let attachment = string("📎").then(
  seqObj(['key', ident], ['query', query.atMost(1)])
).node('attachment')

let template = lazy(() => string("✏️").then(parenthesized(text)).node('template'))
let text = lazy(() => alt(
  role, query, toggle, attachment, template
).skip(ows).or(plainText).atLeast(1)).thru(withSpan).map(([p, matchedText]) => {
  const words = [], obj = {}
  p.forEach(thing => {
    if (thing.name){
      let coll = plural(thing.name)
      if (!obj[coll]) obj[coll] = []
      if (thing.matchedText) thing.value.matchedText = thing.matchedText
      obj[coll].push(thing.value || thing)
    } else {
      words.push(thing)
    }
  })
  obj.type = 'text'
  obj.text = words.join(' ')
  obj.matchedText = matchedText
  return obj
})

function plural(x){
  if (x == 'query') return 'queries'
  else return `${x}s`
}

let when = seqObj(
  string('/when'),
  ows,
  ['query', query],
  ws,
  ['text', text]
).thru(withSpan).map(([o,t]) => {o.type = 'when'; o.matchedText=t; return o} )

function parse(t){
  return when.or(text).parse(t)
}


// console.log(when.tryParse("/when {$x/foo} hello"))
  
// console.log( parse("hello 📎foo 📎bar 📎baz") )
// console.log( parse("do reply templates work ✏️(lets check) ") )
// console.log( parse("How about a query {$x/clicked/bringingSalad} ") )

// debugger;


//////////
// /when

// let timeUnit = string('days')
// let number = regexp(/[0-9]+/).map(Number).desc('number')
// let duration = seq(number.skip(ws), timeUnit).map(x => (
//   Number(x[0]) * {s: 1, m: 60, h: 60*60, d: 60*60*24}[x[1][0]]
// ))

let matchDirective = seqObj(
  string('/match'),
  ws,
  ['key', ident],
  ['params', role.or(variable).sepBy1(ws)],
  
).node('match')
let directive = matchDirective

let entry = text.or(directive).atLeast(1)


function span(parser){
  return Parsimmon(function(input, i) {
    var result = parser._(input, i);
    if (!result.status) return result;
    result.value = input.slice(i, result.index)
    return Parsimmon.makeSuccess(result.index, result.value)
  })
}

function withSpan(parser){
  return Parsimmon(function(input, i) {
    var result = parser._(input, i);
    if (!result.status) return result;
    result.value = [result.value, input.slice(i, result.index)]
    return Parsimmon.makeSuccess(result.index, result.value)
  })
}

export {parse}

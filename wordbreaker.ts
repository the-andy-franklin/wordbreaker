const fs = require('fs')
const args = process.argv.slice(2)

const wordCost: { [key: string]: number } = {}
let maxWordLen = 0

const data = fs.readFileSync('./wordlist.txt', {encoding: 'utf-8'})

const words: string[] = data.split('\n')
words.forEach((word, index) => {
  wordCost[word] = Math.log((index + 1) * Math.log(words.length));
  if (word.length > maxWordLen) {
    maxWordLen = word.length
  }
})

args.forEach((arg) => {
  console.log(breakwords(arg).join(' '))
})

function breakwords(str: string): string[] {
  const list: string[] = []
  str.split(/\b(?=[^\w'])|(?<=[^\w'])\b/g).forEach((substring: string) => {
    if (substring.match(/[^\w']/)) {
      list.push(substring)
    } else {
      _split(substring).forEach((word: string) => {
        list.push(word)
      })
    }
  })
  return list
}

function _split(s: string): string[] {
  const cost = [0]

  function best_match(i: number): number[] {
    const candidates = cost.slice(Math.max(0, i - maxWordLen), i).reverse();
    let minPair = [Number.MAX_SAFE_INTEGER, 0];
    candidates.forEach((c: number, k: number) => {
      if (wordCost[s.substring(i - k - 1, i)]) {
        const ccost = c + wordCost[s.substring(i - k - 1, i).toLowerCase()]
        if (ccost < minPair[0]) {
          minPair = [ccost, k + 1]
        }
      }
    })
    return minPair
  }

  for (let i = 1; i < s.length + 1; i++) {
    cost.push(best_match(i)[0])
  }

  const out: string[] = []
  for (let i = s.length; i > 0; i -= best_match(i)[1]) {
    const [c, k] = best_match(i)

    if (out.length > 0) {
      const outTail = out.slice(-1)[0]
      if (outTail.match(/^'s$/) || (outTail.match(/^\d+('s)?$/) && s[i - 1].match(/^\d$/))) {
        out.pop()
        out.push(s.slice(i - k, i) + outTail)
      } else {
        out.push(s.slice(i - k, i))
      }
    } else {
      out.push(s.slice(i - k, i))
    }
  }

  return out.reverse();
}
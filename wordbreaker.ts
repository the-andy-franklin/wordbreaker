require('./logger');
const argv = require('yargs')(process.argv.slice(2)).argv;
if (!argv._.length) process.exit(1);

const fs = require('fs');
const data = fs.readFileSync('./wordlist.txt', { encoding: 'utf-8' });
const wordlist = data.split('\n');

let maxWordLen = 0;
const wordCostLibrary: { [key: string]: number } = {};

wordlist.forEach((word, index) => {
	wordCostLibrary[word] = Math.log((index + 1) * Math.log(wordlist.length));
	if (word.length > maxWordLen) {
		maxWordLen = word.length;
	}
});

argv._.forEach((arg: string) => {
	console.log(
		breakwords(arg)
			.join(' ')
			.replace(/\s([,.!?])/g, '$1'),
	);
});

function breakwords(str: string): string[] {
	const finalWordList: string[] = [];
	str.split(/\b(?=[^\w'])|(?<=[^\w'])\b/g).forEach((substring: string) => {
		if (substring.match(/[^\w']/)) {
			finalWordList.push(substring);
		} else {
			split(substring).forEach((word: string) => {
				finalWordList.push(word);
			});
		}
	});
	return finalWordList;
}

function split(str: string): string[] {
	const cost = [0];

	function best_match(num: number): number[] {
		const candidates = cost.slice(Math.max(0, num - maxWordLen), num).reverse();
		let minPair = [Number.MAX_SAFE_INTEGER, 0];
		candidates.forEach((candidate: number, i: number) => {
			const wordCost =
				wordCostLibrary[str.substring(num - i - 1, num).toLowerCase()];
			if (wordCost) {
				const candidateCost = candidate + wordCost;
				if (candidateCost < minPair[0]) {
					minPair = [candidateCost, i + 1];
				}
			}
		});
		return minPair;
	}

	for (let i = 1; i <= str.length; i++) {
		cost.push(best_match(i)[0]);
	}

	const out: string[] = [];
	for (let i = str.length; i > 0; i -= best_match(i)[1]) {
		const [, j] = best_match(i);

		let newToken = true;
		if (out.length > 0) {
			const outTail = out.slice(-1)[0];
			if (
				outTail.match(/^'\w+$/) ||
				(outTail.match(/^\d+$/) && str[i - 1].match(/^\d$/))
			) {
				out.pop();
				out.push(str.slice(i - j, i) + outTail);
				newToken = false;
			}
		}

		if (newToken) {
			out.push(str.slice(i - j, i));
		}
	}

	return out.reverse();
}

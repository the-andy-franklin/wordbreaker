require('./logger');
const argv = require('yargs')(process.argv.slice(2)).argv;
if (!argv._.length) process.exit(1);

const fs = require('fs');
const data = fs.readFileSync('./wordlist.txt', { encoding: 'utf-8' });
const wordlist: string[] = data.split('\n');

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

	function getBestMatch(i: number): number[] {
		const candidates = cost.slice(Math.max(0, i - maxWordLen), i).reverse();
		let minPair = [Number.MAX_SAFE_INTEGER, 0];

		candidates.forEach((candidate: number, j: number) => {
			const wordCost = wordCostLibrary[str.substring(i - j - 1, i).toLowerCase()];
			if (wordCost) {
				const candidateCost = candidate + wordCost;
				if (candidateCost < minPair[0]) {
					minPair = [candidateCost, j + 1];
				}
			}
		});

		return minPair;
	}

	for (let i = 1; i <= str.length; i++) {
		cost.push(getBestMatch(i)[0]);
	}

	const out: string[] = [];
	// eslint-disable-next-line prettier/prettier
	for (
		let j: number, i: number = str.length;
		(j = getBestMatch(i)[1]), i > 0;
		i -= j
	) {
		let newToken = true;

		if (out.length > 0) {
			const outTail = out.slice(-1)[0];
			if (
				outTail.match(/^('s|'d|'ll|'ve|n't)+$/) ||
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

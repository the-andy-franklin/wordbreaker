const chalk = require('chalk');
['debug', 'log', 'warn', 'error'].forEach((methodName) => {
	const originalMethod = console[methodName];
	console[methodName] = (...args) => {
		try {
			throw new Error();
		} catch (error) {
			const trace = error.stack // grab the stack trace
				.split('\n')[2] // slice off first 2 lines
				.trim() // remove excess space
				.substring(3) // remove first 3 characters ("at ")
				.replace(`${process.cwd()}/`, '') // remove script folder path
				.replace(/\s\(/, ' at ') // removes the open parens and replaces it with " at "
				.replace(/\)/, ''); // removes close parens

			originalMethod.apply(console, [chalk.green(trace), '\n', ...args]);
		}
	};
});

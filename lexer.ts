type Config = {
	preferTabs: boolean,
	indentationSize: number,
	inFolder: string,
	outFolder: string,
	fileExtension: string,
	lineSeparator: string
}

import fs from 'fs';
import path from 'path';

export function processFile(content: string, line_separator: string, tab_char: string): string {
	let level = 0;
	let awaiting_newline: (-1 | 1)[] = [];
	let val = '';
	let actual_length = 0;
	let lines: string[] = [];
	content.split('').forEach((c, i) => {
		switch (c) {
			case '{':
				awaiting_newline.push(1)
				break;

			case '}':
				// awaiting_newline.push(-1);
				level--;
				actual_length++;
				break;

			case line_separator:
				let trimmed = val.trim();

				if(val.length > 0 || actual_length === 0) lines.push(tab_char.repeat(level) + trimmed);
				val = '';
				actual_length = 0;
				awaiting_newline.forEach(n => {
					level += n;
					awaiting_newline.shift();
				});
				break;

			default:
				val += c;
				break;
		}
	});

	return lines.join('\n');
}

export function writeOutFile(file: string, content: string) {
	let file_parts = file.split('.');
	file_parts.pop();
	file_parts.push('py');
	fs.writeFileSync(file_parts.join('.'), content);
}

export default function (config: Config) {
	const files = fs.readdirSync(config.inFolder).filter(f => f.endsWith(config.fileExtension));

	files.forEach(file => {
		const content = fs.readFileSync(path.join(config.inFolder, file), 'utf8');

		writeOutFile(path.join(config.outFolder, file), processFile(content, config.lineSeparator, config.preferTabs ? '\t' : ' '.repeat(config.indentationSize)));
	});
}
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

	let IF = 'if';
	let DEF = 'def';
	let ELSE = 'else';
	let ELIF = 'elif';

	let token = '';

	let in_singleq_string = false;
	let in_doubleq_string = false;
	let in_tripleq_string = false; // TODO add """/''' support
	let in_string = false;

	let ignore_next_char = false;

	let was_viable = false;
	let is_viable = false;

	content.endsWith(line_separator) || (content += line_separator);

	content.split('').forEach((c, i) => {
		// console.log(token);
		switch (c) {
			case ':':
			case ' ':
			case '\t':
			case '	':
				if (!in_string) {
					if ([IF, DEF, ELSE, ELIF].includes(token)) {
						is_viable = true;
					}

					token = '';
				}
				val += c;
			break;

			case '\\':
				ignore_next_char = true;
				break;

			case '"':
				if (!ignore_next_char) in_doubleq_string = !in_doubleq_string; else ignore_next_char = false;
				val += c;

				in_string = in_doubleq_string || in_singleq_string || in_tripleq_string;

				if (in_string) {
					if(is_viable) was_viable = true;
					is_viable = false;
				} else {
					is_viable = was_viable;
					was_viable = false;
				}
				break;
			case "'":
				if (!ignore_next_char) in_singleq_string = !in_singleq_string; else ignore_next_char = false;
				val += c;

				in_string = in_doubleq_string || in_singleq_string || in_tripleq_string;

				if (in_string) {
					if(is_viable) was_viable = true;
					is_viable = false;
				} else {
					is_viable = was_viable;
					was_viable = false;
				}
				break;

			case '{':
				if (!is_viable) {
					val += c;
					break;
				}
				awaiting_newline.push(1)
				break;

			case '}':
				if (!is_viable) {
					val += c;
					break;
				}
				// awaiting_newline.push(-1);
				level--;
				actual_length++;
				if (level === 0) (is_viable = false);
				break;

			case line_separator:
				token = '';
				let trimmed = val.trim();

				if (trimmed.length > 0 || actual_length === 0) lines.push(tab_char.repeat(level) + trimmed);
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
		if (Array.from(new Set((IF + DEF + ELSE + ELIF).split(''))).includes(c) && !in_string) token += c;
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
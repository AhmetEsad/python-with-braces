export default function (args: string[]) {
	let out = {};
	args.forEach((arg, i) => {
		if(!arg.startsWith('--')) return;
		arg = arg.substring(2);
		args[i + 1]?.startsWith('--') ? (out[arg] = true) : (out[arg] = args[i + 1]);
	});
	return out;
}
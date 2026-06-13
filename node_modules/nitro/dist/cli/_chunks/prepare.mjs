import { ft as resolve } from "../../_build/common.mjs";
import { t as defineCommand } from "../../_libs/citty.mjs";
import { t as commonArgs } from "./common.mjs";
import { createNitro, writeTypes } from "nitro/builder";
var prepare_default = defineCommand({
	meta: {
		name: "prepare",
		description: "Generate types for the project"
	},
	args: { ...commonArgs },
	async run({ args }) {
		await writeTypes(await createNitro({ rootDir: resolve(args.dir || args._dir || ".") }));
	}
});
export { prepare_default as default };

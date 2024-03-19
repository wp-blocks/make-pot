import { SetOfBlocks } from 'gettext-merger'
import { Args } from '../types'

/**
 * Task runner for the extraction process.
 *
 * @param tasks - The tasks to run
 * @param destination - The destination
 * @param args - The command line arguments
 */
export async function taskRunner(
	tasks: Promise<SetOfBlocks>[],
	destination: SetOfBlocks,
	args: Args
) {
	await Promise.allSettled(tasks)
		.then((strings) => {
			// return the strings
			return strings
				.map((block) => block.status === 'fulfilled' && block.value)
				.filter(Boolean) as SetOfBlocks[] // remove false 👆
		})
		.then((consolidated) => {
			console.log('🎉 Done!')
			consolidated.forEach((result) => {
				if (result.blocks.length > 0) {
					console.log(
						'✅ Found',
						result.blocks.map((b) => b.msgid).join(', '),
						'strings in',
						result.path
					)
					result.blocks.forEach((b) => destination.add(b))
				} else console.log('❌ No strings found in', result.path)
			})
		})
		.catch((err) => {
			console.log('❌ Failed!', err)
			process.exit(1)
		})

	if (!args.options?.silent) {
		console.log(
			'📝 Found',
			Object.values(destination).length,
			'groups of strings and ' +
				Object.values(destination.blocks).length +
				' strings were found'
		)
	}

	return destination
}

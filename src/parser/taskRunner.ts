import { SetOfBlocks } from 'gettext-merger'
import { Args } from '../types'
import { SingleBar } from 'cli-progress'

/**
 * Task runner for the extraction process.
 *
 * @param tasks - The tasks to run
 * @param destination - The destination
 * @param args - The command line arguments
 * @param progressBar
 */
export async function taskRunner(
	tasks: Promise<SetOfBlocks>[],
	destination: SetOfBlocks,
	args: Args,
	progressBar?: SingleBar
) {
	await Promise.allSettled(tasks)
		.then((strings) => {
			/**
			 * Return the strings that are not rejected (they are fulfilled)
			 */
			return strings
				.map((block) => block.status === 'fulfilled' && block.value)
				.filter(Boolean) as SetOfBlocks[] // remove false 👆
		})
		.then((consolidated) => {
			consolidated.forEach((result) => {
				if (result.blocks.length > 0) {
					/**
					 * Add the strings to the destination set
					 */
					destination.addArray(result.blocks)
					/* Log the results */
					console.log(
						'✅ ' + result.path + ' [',
						result.blocks.map((b) => b.msgid).join(', '),
						']'
					)
				} else console.log('❌ ', result.path + ' has no strings')
			})

			progressBar?.stop()
		})
		.catch((err) => {
			console.log('❌ Failed!', err)
			process.exit(1)
		})

	if (!args.options?.silent) {
		console.log('🎉 Done!')
		console.log(
			'📝 Found',
			Object.values(destination.blocks).length,
			'translation strings in',
			args.paths.cwd
		)
	}

	return destination
}

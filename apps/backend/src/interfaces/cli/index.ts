import prompt from 'prompt'

import 'config/env'

import { useCasesCli } from 'api/core/cli'
import { IUseCaseCli } from 'api/core/framework/use-case/cli'

import { logger } from 'config/logger'

const ERROR_CODE = 1
const SUCCESS_CODE = 0

function getCommand(): string {
  const command = process.argv.slice(2)[0]
  if (!command) {
    logger.error('No command sent')
    process.exit(ERROR_CODE)
  }
  return command
}

function getUseCase(command: string): IUseCaseCli {
  const useCase = useCasesCli[command]
  if (!useCase) {
    logger.error('The command is not implemented')
    process.exit(ERROR_CODE)
  }
  return useCase
}

function handleInputs(useCase: IUseCaseCli) {
  return async (err: Error | null, result: unknown): Promise<void> => {
    if (err) {
      logger.error(err)
      process.exit(ERROR_CODE)
    }
    try {
      await useCase.executeCli(result)
      process.exit(SUCCESS_CODE)
    } catch (e) {
      logger.error(e)
      process.exit(ERROR_CODE)
    }
  }
}

function start(): void {
  const command = getCommand()
  const useCase = getUseCase(command)
  prompt.start()
  const inputProperties = useCase.getCliProperties()
  prompt.get(inputProperties, handleInputs(useCase))
}

start()

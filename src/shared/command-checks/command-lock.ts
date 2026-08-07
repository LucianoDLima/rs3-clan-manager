const runningCommands = new Set<string>();

function isCommandRunning(commandName: string) {
  return runningCommands.has(commandName);
}

function startCommand(commandName: string) {
  runningCommands.add(commandName);
}

function finishCommand(commandName: string) {
  runningCommands.delete(commandName);
}

export { isCommandRunning, startCommand, finishCommand };

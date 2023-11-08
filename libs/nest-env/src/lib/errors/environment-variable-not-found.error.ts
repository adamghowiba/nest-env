export class EnvironmentVariablesNotFoundError extends Error {
  constructor(message: string) {
    super(message);

    this.stack = undefined;
  }
}

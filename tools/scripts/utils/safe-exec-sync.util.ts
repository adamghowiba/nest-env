import { ExecSyncOptionsWithStringEncoding, execSync } from 'child_process';

/**
 * Exec sync with better error handling
 * @param command
 * @param options
 * @returns
 */
export const safeExecSync = (
  command: string,
  options?: ExecSyncOptionsWithStringEncoding & {
    error?: string;
  }
) => {
  try {
    return execSync(command, { encoding: 'utf-8', ...options });
  } catch (error) {
    if (error instanceof Error) {
      if (options?.error) {
        // Throw a new error with the custom message
        throw new Error(options.error);
      }

      if ((error as any).output) throw new Error((error as any).output);
    }

    throw error;
  }
};

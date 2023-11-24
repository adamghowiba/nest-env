import { confirm, input, select } from '@inquirer/prompts';
import { ExecSyncOptionsWithStringEncoding, execSync } from 'child_process';
import { program } from 'commander';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { ReleaseType, inc, lte, valid } from 'semver';
import { LiteralUnion } from '../../libs/nest-env/src';
import { safeExecSync } from './utils/safe-exec-sync.util';

const nestEnvRootPath = path.join(process.cwd(), 'libs/nest-env');
const nestEnvPackageJsonPath = path.join(nestEnvRootPath, 'package.json');
const packageJsonUtf = readFileSync(nestEnvPackageJsonPath, 'utf8').toString();
const packageJson = JSON.parse(packageJsonUtf);
const currentVersion: string = packageJson?.version;

const updateVersion = (version: string) => {
  try {
    const tempPackageJson = { ...packageJson };
    tempPackageJson.version = version;

    writeFileSync(
      nestEnvPackageJsonPath,
      JSON.stringify(tempPackageJson, null, 2)
    );
  } catch (error) {
    console.error(`Error reading package.json file from library build output.`);
    throw error;
  }
};

const promptReleaseTag = async () => {
  const result: LiteralUnion<'latest' | 'next' | 'experimental', string> =
    await select({
      message: 'What type of publish?',
      default: 'next',
      choices: [
        {
          value: 'next',
          name: 'Next',
        },
        {
          value: 'latest',
          name: 'Latest',
        },
        {
          value: 'experimental',
          name: 'Experimental',
        },
      ],
    });

  return result;
};

const confirmPublish = async (version: string) => {
  const confirmation = await confirm({
    message: 'Are you sure you want to publish version ' + version + '?',
  });

  return confirmation;
};

const publishPackage = async (params: {
  version: string;
  previousVersion: string;
  tag?: string;
}) => {
  try {
    const tag = await promptReleaseTag();

    const confirmation = await confirmPublish(params.version);
    if (!confirmation) return process.exit(0);

    const testOutput = safeExecSync(`npx nx test nest-env`, {
      encoding: 'utf-8',
      error: 'nest-env tests failed',
    });
    console.debug('Test suites ran successfully');
    const buildOutput = safeExecSync(`npx nx build nest-env`, {
      encoding: 'utf-8',
      error: 'nest-env build failed to run',
    });
    console.debug('nest-env built successfully');

    updateVersion(params.version);

    process.chdir(nestEnvRootPath);
    execSync(`npm publish --access public --tag ${tag || 'next'}`);
  } catch (error) {
    updateVersion(params.previousVersion);

    throw error;
  }
};

const handleBuildCommand = async (type: any, options: any) => {
  const nextVersion = inc(currentVersion, 'patch', undefined, 'next');
  const previousVersion = currentVersion;

  const releaseType: ReleaseType | 'custom' = await select({
    message: 'What type of publish?',
    pageSize: 30,
    choices: [
      {
        value: 'major',
        name: 'Major',
        description: `Major release ${inc(currentVersion, 'major')}`,
      },
      {
        value: 'minor',
        name: 'Minor',
        description: `Minor release ${inc(currentVersion, 'minor')}`,
      },
      {
        value: 'patch',
        name: 'Patch',
        description: `Patch release ${inc(currentVersion, 'patch')}`,
      },
      {
        value: 'premajor',
        name: 'pre-major',
        description: `pre-major release ${inc(currentVersion, 'premajor')}`,
      },
      {
        value: 'preminor',
        name: 'pre-minor',
        description: `pre-minor release ${inc(currentVersion, 'preminor')}`,
      },
      {
        value: 'prepatch',
        name: 'pre-patch',
        description: `pre-patch release ${inc(currentVersion, 'prepatch')}`,
      },
      {
        value: 'prerelease',
        name: 'pre-release',
        description: `pre-release release ${inc(currentVersion, 'prerelease')}`,
      },
      {
        value: 'custom',
        name: 'Custom',
        description: 'Provide custom version',
      },
    ],
  });

  if (releaseType === 'custom') {
    const customVersion = await input({
      message: 'Version number?',
      default: nextVersion || undefined,
      validate: (input) => {
        if (!valid(input)) return `Invalid version number ${input}, try again`;

        if (lte(input, currentVersion))
          return `Version number ${input} cannot be lower or equal current version ${currentVersion}`;

        return true;
      },
    });

    await publishPackage({
      version: customVersion,
      previousVersion,
      tag: 'next',
    });
    return;
  }

  const updatedVersion = inc(currentVersion, releaseType, undefined, 'next');
  if (!updatedVersion)
    return console.error('Error updating package.json version');

  publishPackage({ version: updatedVersion, previousVersion, tag: 'next' });
};

const publishCommand = program
  .command('publish')
  .argument('[type]', 'Type of publish')
  .option('--first')
  .option('-s, --separator <Main>')
  .action(handleBuildCommand);

program.addCommand(publishCommand, {});
program.parse();

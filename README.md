# NestJS Env

More sophisticated NestJS environment variable & config management. Designed to handle multi-environment configuration with support for popular config services IE (AWS SSM)

## Caveats

nest-env currently has a peer dependency with [@nestjs/config](https://docs.nestjs.com/techniques/configuration). We're phasing out the requirement this dependency allowing it to be toggled.

Roadmap:
[] AWS SSM
[] Customizable validation messages
[] Custom NestJS config service

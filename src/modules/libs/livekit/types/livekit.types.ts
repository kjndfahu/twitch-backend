import { FactoryProvider, ModuleMetadata } from "@nestjs/common"

export const LiveKitOptionsSymbol = Symbol('LiveKitOptionsSymbol')

export type TypeLivekitOptions = {
    apiUrl: string,
    apiKey: string,
    apiSecret: string
}

export type TypeLivekitAsyncOptions = Pick<ModuleMetadata, 'imports'> & Pick<FactoryProvider<TypeLivekitOptions>, 'useFactory' | 'inject'>
export interface LoadUserAccountRepository {
    load: (params: LoadUserAccountRepository.Params) => Promise<LoadUserAccountRepository.Params>
}

export namespace LoadUserAccountRepository {
    export type Params = {
        email: string
    }
}
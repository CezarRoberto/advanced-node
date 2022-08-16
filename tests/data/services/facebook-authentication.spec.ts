import {FacebookAuthentication} from '@/domain/features'

class FacebookAuthenticationService {
    constructor(private readonly loadFacebookUserByTokenApi: LoadFacebookUserApi) {}
    async perform (params: FacebookAuthentication.Params): Promise<void> {
        await this.loadFacebookUserByTokenApi.loadUser(params)
    }
}

interface LoadFacebookUserApi {
    loadUser: (params: LoadFacebookUserByTokenApi.Params) => Promise<void>
}

namespace LoadFacebookUserByTokenApi {
    export type Params = {
        token: string
    }
}

class LoadFacebookUserApiSpy implements LoadFacebookUserApi {
    token?: string;
    async loadUser (params: LoadFacebookUserByTokenApi.Params): Promise<void> {
        this.token = params.token
    }
}

describe('FacebookAuthenticationServices', () => {
    it('', async () => {
        const loadFacebookUserApi = new LoadFacebookUserApiSpy()
        const sum = new FacebookAuthenticationService(loadFacebookUserApi)

        await sum.perform({token: 'any_token'})

        expect(loadFacebookUserApi.token).toBe('any_token')
    });
});
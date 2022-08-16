import { FacebookAuthentication } from '@/domain/features'
import { AuthenticationError } from '@/domain/erros'

class FacebookAuthenticationService {
    constructor(private readonly loadFacebookUserApi: LoadFacebookUserApi) {}
    async perform (params: FacebookAuthentication.Params): Promise<AuthenticationError> {
        await this.loadFacebookUserApi.loadUser(params)
        return new AuthenticationError()
    }
}

interface LoadFacebookUserApi {
    loadUser: (params: LoadFacebookUserApi.Params) => Promise<LoadFacebookUserApi.Result>
}

namespace LoadFacebookUserApi {
    export type Params = {
        token: string
    }

    export type Result = undefined
}

class LoadFacebookUserApiSpy implements LoadFacebookUserApi {
    token?: string;
    result = undefined;

    async loadUser (params: LoadFacebookUserApi.Params): Promise<LoadFacebookUserApi.Result> {
        this.token = params.token
        return this.result
    }
}

describe('FacebookAuthenticationServices', () => {
    it('should call loadFacebookUserApi with all params', async () => {
        const loadFacebookUserApi = new LoadFacebookUserApiSpy()
        const sum = new FacebookAuthenticationService(loadFacebookUserApi)

        await sum.perform({token: 'any_token'})

        expect(loadFacebookUserApi.token).toBe('any_token')
    });

    it('should return AuthenticationError when loadFacebookUserApi returns undefined', async () => {
        const loadFacebookUserApi = new LoadFacebookUserApiSpy()
        loadFacebookUserApi.result = undefined
        const sum = new FacebookAuthenticationService(loadFacebookUserApi)

        const authResult = await sum.perform({token: 'any_token'})

        expect(authResult).toEqual(new AuthenticationError)
    });
});
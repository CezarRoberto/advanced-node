import { LoadFacebookUserApi } from "@/data/contracts/apis";
import { HttpGetClient } from "@/infra/http";

type AppToken = {
    acess_token: string
}

type DebugToken = {
    data: {
        user_id: string
    }
}

type UserInfo = {
    id: string
    name: string
    email: string
}

export class FacebookApi implements LoadFacebookUserApi {
    private readonly baseUrl = 'https://graph.facebook.com'

    constructor(
        private readonly httpClient: HttpGetClient,
        private readonly clientId: string,
        private readonly clientSecret: string,
        ) {}

    async loadUser(params: LoadFacebookUserApi.Params): Promise<LoadFacebookUserApi.Result> {
        const userInfo = await this.getUserInfo(params.token)
        return {
            facebookId: userInfo.id,
            name: userInfo.name,
            email: userInfo.email
        }
    }

    private async getAppToken(): Promise<AppToken> {
        return this.httpClient.get({
            url: `${this.baseUrl}/oauth/acess_token`,
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials'
        }})
    }

    private async getDebugToken(clientTokenDebug: string): Promise<DebugToken> {
        const appToken = await this.getAppToken()
        return await this.httpClient.get({
            url: `${this.baseUrl}/debug_token`,
            params: {
                acess_token: appToken.acess_token,
                input_token: clientTokenDebug
        }})
    }

    private async getUserInfo(clientToken: string): Promise<UserInfo> {
        const debugToken =  await this.getDebugToken(clientToken)
        return  await this.httpClient.get({
            url: `${this.baseUrl}/debug_token/${debugToken.data.user_id}`,
            params: {
                fields: ['id', 'name', 'email'].join(', '),
                acess_token: clientToken,
        }})
    }
}
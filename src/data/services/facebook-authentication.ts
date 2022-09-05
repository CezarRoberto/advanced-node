import { AuthenticationError } from "@/domain/erros";
import { FacebookAuthentication } from "@/domain/features";
import { LoadUserAccountRepository, SaveFacebookAccountRepository } from "../contracts/repositories";
import { LoadFacebookUserApi } from "@/data/contracts/apis";
import { TokenGenerator } from "@/data/contracts/crypto";
import { AcessToken, FacebookAccount } from "@/domain/models";

export class FacebookAuthenticationService implements FacebookAuthentication {
    constructor(
        private readonly facebookApi: LoadFacebookUserApi,
        private readonly userAccountRepo: LoadUserAccountRepository & SaveFacebookAccountRepository,
        private readonly crypto: TokenGenerator
    ) {}
    async perform(
        params: FacebookAuthentication.Params
    ): Promise<FacebookAuthentication.Result> {
        const fbData = await this.facebookApi.loadUser(params);
        if (fbData !== undefined) {
            const accountData = await this.userAccountRepo.load({ email: fbData.email });
            const fbAccount = new FacebookAccount(fbData, accountData)
            const { id } = await this.userAccountRepo.saveWithFacebook(fbAccount)
            const token = await this.crypto.generateToken({ key: id, expirationInMs: AcessToken.expirationInMs })
            return new AcessToken(token)
        }
        return new AuthenticationError();
    }
}

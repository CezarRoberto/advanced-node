import { AuthenticationError } from "@/domain/erros";
import { FacebookAuthentication } from "@/domain/features";
import { LoadUserAccountRepository } from "../contracts/repositories";
import { LoadFacebookUserApi } from "@/data/contracts/apis";

export class FacebookAuthenticationService {
    constructor(
        private readonly loadFacebookUserApi: LoadFacebookUserApi,
        private readonly loadUserAccountRepo: LoadUserAccountRepository
    ) {}
    async perform(
        params: FacebookAuthentication.Params
    ): Promise<AuthenticationError> {
        const fbData = await this.loadFacebookUserApi.loadUser(params);
        if (fbData !== undefined) {
            await this.loadUserAccountRepo.load({ email: fbData.email });
        }
        return new AuthenticationError();
    }
}

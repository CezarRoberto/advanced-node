import { AuthenticationError } from "@/domain/erros";
import {
    CreateFacebookAccountRepository,
    LoadUserAccountRepository,
} from "../contracts/repositories";
import { FacebookAuthenticationService } from "@/data/services";
import { LoadFacebookUserApi } from "../contracts/apis";
import { mock, MockProxy } from "jest-mock-extended";

describe("FacebookAuthenticationServices", () => {
    let facebookApi: MockProxy<LoadFacebookUserApi>;
    let userAccountRepo: MockProxy<
        LoadUserAccountRepository & CreateFacebookAccountRepository
    >;
    let sum: FacebookAuthenticationService;
    const token = "any_token";

    beforeEach(() => {
        facebookApi = mock();
        userAccountRepo = mock();
        facebookApi.loadUser.mockResolvedValue({
            name: "any_fb_name",
            email: "any_fb_email",
            facebookId: "any_fb_id",
        });
        sum = new FacebookAuthenticationService(facebookApi, userAccountRepo);
    });

    it("should call loadFacebookUserApi with correct params", async () => {
        await sum.perform({ token });

        expect(facebookApi.loadUser).toHaveBeenCalledWith({
            token,
        });
        expect(facebookApi.loadUser).toHaveBeenCalledTimes(1);
    });

    it("should return AuthenticationError when loadFacebookUserApi returns undefined", async () => {
        facebookApi.loadUser.mockResolvedValueOnce(undefined);

        const authResult = await sum.perform({ token });

        expect(authResult).toEqual(new AuthenticationError());
    });

    it("should return LoadUserAccountRepo when loadFacebookUserApi returns data", async () => {
        await sum.perform({ token });

        expect(userAccountRepo.load).toHaveBeenCalledWith({
            email: "any_fb_email",
        });
        expect(userAccountRepo.load).toHaveBeenCalledTimes(1);
    });

    it("should call CreateUserAccount when facebookApi returns undefined", async () => {
        userAccountRepo.load.mockResolvedValueOnce(undefined);

        await sum.perform({ token });

        expect(userAccountRepo.createFromFacebook).toHaveBeenCalledWith({
            email: "any_fb_email",
            name: "any_fb_name",
            facebookId: "any_fb_id",
        });
        expect(userAccountRepo.createFromFacebook).toHaveBeenCalledTimes(1);
    });
});

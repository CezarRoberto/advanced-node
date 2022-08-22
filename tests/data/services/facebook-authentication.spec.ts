import { AuthenticationError } from "@/domain/erros";
import { LoadUserAccountRepository } from "../contracts/repositories";
import { FacebookAuthenticationService } from "@/data/services";
import { LoadFacebookUserApi } from "../contracts/apis";
import { mock, MockProxy } from "jest-mock-extended";

describe("FacebookAuthenticationServices", () => {
    let loadFacebookUserApi: MockProxy<LoadFacebookUserApi>;
    let loadUserAccountRepo: MockProxy<LoadUserAccountRepository>;
    let sum: FacebookAuthenticationService;
    const token = "any_token";

    beforeEach(() => {
        loadFacebookUserApi = mock();
        loadUserAccountRepo = mock();
        loadFacebookUserApi.loadUser.mockResolvedValue({
            name: "any_fb_name",
            email: "any_fb_email",
            facebookId: "any_fb_id",
        });
        sum = new FacebookAuthenticationService(
            loadFacebookUserApi,
            loadUserAccountRepo
        );
    });
    it("should call loadFacebookUserApi with all params", async () => {
        await sum.perform({ token });

        expect(loadFacebookUserApi.loadUser).toHaveBeenCalledWith({
            token,
        });
        expect(loadFacebookUserApi.loadUser).toHaveBeenCalledTimes(1);
    });

    it("should return AuthenticationError when loadFacebookUserApi returns undefined", async () => {
        loadFacebookUserApi.loadUser.mockResolvedValueOnce(undefined);

        const authResult = await sum.perform({ token });

        expect(authResult).toEqual(new AuthenticationError());
    });

    it("should return LoadUserAccountRepo when loadFacebookUserApi returns data", async () => {
        await sum.perform({ token });

        expect(loadUserAccountRepo.load).toHaveBeenCalledWith({
            email: "any_fb_email",
        });
        expect(loadUserAccountRepo.load).toHaveBeenCalledTimes(1);
    });
});

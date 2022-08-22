import { AuthenticationError } from "@/domain/erros";
import { CreateFacebookAccountRepository, LoadUserAccountRepository } from "../contracts/repositories";
import { FacebookAuthenticationService } from "@/data/services";
import { LoadFacebookUserApi } from "../contracts/apis";
import { mock, MockProxy } from "jest-mock-extended";

describe("FacebookAuthenticationServices", () => {
    let loadFacebookUserApi: MockProxy<LoadFacebookUserApi>;
    let loadUserAccountRepo: MockProxy<LoadUserAccountRepository>;
    let createFacebookAccountRepo: MockProxy<CreateFacebookAccountRepository>
    let sum: FacebookAuthenticationService;
    const token = "any_token";

    beforeEach(() => {
        loadFacebookUserApi = mock();
        loadUserAccountRepo = mock();
        createFacebookAccountRepo = mock();
        loadFacebookUserApi.loadUser.mockResolvedValue({
            name: "any_fb_name",
            email: "any_fb_email",
            facebookId: "any_fb_id",
        });
        sum = new FacebookAuthenticationService(
            loadFacebookUserApi,
            loadUserAccountRepo,
            createFacebookAccountRepo
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


    it("should call CreateUserAccount when loadFacebookUserApi returns undefined", async () => {
        loadUserAccountRepo.load.mockResolvedValueOnce(undefined)

        await sum.perform({ token });

        expect(createFacebookAccountRepo.createFromFacebook).toHaveBeenCalledWith({
            email: "any_fb_email",
            name: "any_fb_name",
            facebookId: "any_fb_id",
        });
        expect(createFacebookAccountRepo.createFromFacebook).toHaveBeenCalledTimes(1);
    });
});

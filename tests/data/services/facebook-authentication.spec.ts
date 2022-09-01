import { AuthenticationError } from "@/domain/erros";
import {
    LoadUserAccountRepository,
    SaveFacebookAccountRepository,
} from "../contracts/repositories";
import { FacebookAuthenticationService } from "@/data/services";
import { LoadFacebookUserApi } from "../contracts/apis";
import { mock, MockProxy } from "jest-mock-extended";

describe("FacebookAuthenticationServices", () => {
    let facebookApi: MockProxy<LoadFacebookUserApi>;
    let userAccountRepo: MockProxy<
        LoadUserAccountRepository & SaveFacebookAccountRepository
    >;
    let sut: FacebookAuthenticationService;
    const token = "any_token";

    beforeEach(() => {
        facebookApi = mock();
        userAccountRepo = mock();
        userAccountRepo.load.mockResolvedValue(undefined)
        facebookApi.loadUser.mockResolvedValue({
            name: "any_fb_name",
            email: "any_fb_email",
            facebookId: "any_fb_id",
        });
        sut = new FacebookAuthenticationService(facebookApi, userAccountRepo);
    });

    it("should call loadFacebookUserApi with correct params", async () => {
        await sut.perform({ token });

        expect(facebookApi.loadUser).toHaveBeenCalledWith({
            token,
        });
        expect(facebookApi.loadUser).toHaveBeenCalledTimes(1);
    });

    it("should return AuthenticationError when loadFacebookUserApi returns undefined", async () => {

        const authResult = await sut.perform({ token });

        expect(authResult).toEqual(new AuthenticationError());
    });

    it("should return LoadUserAccountRepo when loadFacebookUserApi returns data", async () => {
        await sut.perform({ token });

        expect(userAccountRepo.load).toHaveBeenCalledWith({
            email: "any_fb_email",
        });
        expect(userAccountRepo.load).toHaveBeenCalledTimes(1);
    });

    it("should create account with facebook data", async () => {

        await sut.perform({ token });

        expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledWith({
            email: "any_fb_email",
            name: "any_fb_name",
            facebookId: "any_fb_id",
        });
        expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledTimes(1);
    });

    it("should not update account name", async () => {
        userAccountRepo.load.mockResolvedValueOnce({
            id: 'any_id',
            name: 'any_name',
        });

        await sut.perform({ token });

        expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledWith({
            id: 'any_id',
            email: "any_fb_email",
            name: 'any_name',
            facebookId: "any_fb_id",
        });
        expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledTimes(1);
    });

    it("should update a account name", async () => {
        userAccountRepo.load.mockResolvedValueOnce({
            id: 'any_id'
        });

        await sut.perform({ token });

        expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledWith({
            id: 'any_id',
            email: "any_fb_email",
            name: 'any_fb_name',
            facebookId: "any_fb_id",
        });
        expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledTimes(1);
    });
});

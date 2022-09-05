import { AuthenticationError } from "@/domain/erros";
import {
    LoadUserAccountRepository,
    SaveFacebookAccountRepository,
} from "../contracts/repositories";
import { FacebookAuthenticationService } from "@/data/services";
import { LoadFacebookUserApi } from "../contracts/apis";
import { mock, MockProxy } from "jest-mock-extended";
import { createMock } from "ts-jest-mock";
import { FacebookAccount } from "@/domain/models";
import { TokenGenerator } from "@/data/contracts/crypto";

jest.mock("@/domain/models/facebook-account");

describe("FacebookAuthenticationServices", () => {
    let facebookApi: MockProxy<LoadFacebookUserApi>;
    let crypto: MockProxy<TokenGenerator>;
    let userAccountRepo: MockProxy<
        LoadUserAccountRepository & SaveFacebookAccountRepository
    >;
    let sut: FacebookAuthenticationService;
    const token = "any_token";

    beforeEach(() => {
        facebookApi = mock();
        crypto = mock();
        userAccountRepo = mock();
        userAccountRepo.load.mockResolvedValue(undefined);
        userAccountRepo.saveWithFacebook.mockResolvedValueOnce({
            id: 'any_account_id'
        })
        facebookApi.loadUser.mockResolvedValue({
            name: "any_fb_name",
            email: "any_fb_email",
            facebookId: "any_fb_id",
        });
        sut = new FacebookAuthenticationService(facebookApi, userAccountRepo, crypto);
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

    it("should call SaveFacebookAccountRepository with FacebookAccount", async () => {
        const facebookAccountStub = jest
            .fn()
            .mockImplementation(() => ({ any: "any" }));
        createMock(FacebookAccount).mockImplementation(
            jest.fn().mockImplementation(facebookAccountStub)
        );
        await sut.perform({ token });

        expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledWith({
            any: "any",
        });
        expect(userAccountRepo.saveWithFacebook).toHaveBeenCalledTimes(1);
    });

    it("should call TokenGenerator with correct params", async () => {
        await sut.perform({ token });

        expect(crypto.generateToken).toHaveBeenCalledWith({
            key: "any_account_id",
        });
        expect(crypto.generateToken).toHaveBeenCalledTimes(1);
    });
});

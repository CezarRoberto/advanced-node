import { AuthenticationError } from "@/domain/erros";
import {
    LoadUserAccountRepository,
    SaveFacebookAccountRepository,
} from "../contracts/repositories";
import { FacebookAuthenticationService } from "@/data/services";
import { LoadFacebookUserApi } from "../contracts/apis";
import { mock, MockProxy } from "jest-mock-extended";
import { createMock } from "ts-jest-mock";
import { AcessToken, FacebookAccount } from "@/domain/models";
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
        facebookApi.loadUser.mockResolvedValue({
            name: "any_fb_name",
            email: "any_fb_email",
            facebookId: "any_fb_id",
        });
        userAccountRepo = mock();
        userAccountRepo.load.mockResolvedValue(undefined);
        crypto = mock();
        crypto.generateToken.mockResolvedValue("any_generated_token");
        userAccountRepo.saveWithFacebook.mockResolvedValue({
            id: "any_account_id",
        });
        sut = new FacebookAuthenticationService(
            facebookApi,
            userAccountRepo,
            crypto
        );
    });

    it("should call loadFacebookUserApi with correct params", async () => {
        await sut.perform({ token });

        expect(facebookApi.loadUser).toHaveBeenCalledWith({
            token,
        });
        expect(facebookApi.loadUser).toHaveBeenCalledTimes(1);
    });

    it("should return AuthenticationError when loadFacebookUserApi returns undefined", async () => {
        facebookApi.loadUser.mockResolvedValueOnce(undefined);
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
            expirationInMs: AcessToken.expirationInMs,
        });
        expect(crypto.generateToken).toHaveBeenCalledTimes(1);
    });

    it("should retrun a AcessToken on sucess", async () => {
        const authResult = await sut.perform({ token });

        expect(authResult).toEqual(new AcessToken("any_generated_token"));
    });

    it("should rethrow if LoadFacebookUserApi throws", async () => {
        facebookApi.loadUser.mockRejectedValueOnce(new Error("fb_error"));
        const promise = sut.perform({ token });

        await expect(promise).rejects.toThrow(new Error("fb_error"));
    });

    it("should rethrow if LoadUserAccountRepository throws", async () => {
        userAccountRepo.load.mockRejectedValueOnce(new Error("load_error"));
        const promise = sut.perform({ token });

        await expect(promise).rejects.toThrow(new Error("load_error"));
    });

    it("should rethrow if SaveFacebookAccountRepository throws", async () => {
        userAccountRepo.saveWithFacebook.mockRejectedValueOnce(new Error("save_error"));
        const promise = sut.perform({ token });

        await expect(promise).rejects.toThrow(new Error("save_error"));
    });

    it("should rethrow if TokenGenerator throws", async () => {
        crypto.generateToken.mockRejectedValueOnce(new Error("crypto_error"));
        const promise = sut.perform({ token });

        await expect(promise).rejects.toThrow(new Error("crypto_error"));
    });
});

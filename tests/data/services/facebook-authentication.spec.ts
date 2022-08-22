import { AuthenticationError } from "@/domain/erros";
import { FacebookAuthenticationService } from "@/data/services";
import { LoadFacebookUserApi } from "../contracts/apis";
import { mock, MockProxy } from "jest-mock-extended";

describe("FacebookAuthenticationServices", () => {
    let loadFacebookUserApi: MockProxy<LoadFacebookUserApi>;
    let sum: FacebookAuthenticationService;
    beforeEach(() => {
        loadFacebookUserApi = mock<LoadFacebookUserApi>();
        sum = new FacebookAuthenticationService(loadFacebookUserApi);
    });
    it("should call loadFacebookUserApi with all params", async () => {
        await sum.perform({ token: "any_token" });

        expect(loadFacebookUserApi.loadUser).toHaveBeenCalledWith({
            token: "any_token",
        });
        expect(loadFacebookUserApi.loadUser).toHaveBeenCalledTimes(1);
    });

    it("should return AuthenticationError when loadFacebookUserApi returns undefined", async () => {
        loadFacebookUserApi.loadUser.mockResolvedValueOnce(undefined);

        const authResult = await sum.perform({ token: "any_token" });

        expect(authResult).toEqual(new AuthenticationError());
    });
});

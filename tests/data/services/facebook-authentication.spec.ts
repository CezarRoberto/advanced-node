import { AuthenticationError } from "@/domain/erros";
import { FacebookAuthenticationService } from "@/data/services";

describe("FacebookAuthenticationServices", () => {
    it("should call loadFacebookUserApi with all params", async () => {
        const loadFacebookUserApi = {
            loadUser: jest.fn()
        }
        const sum = new FacebookAuthenticationService(loadFacebookUserApi);

        await sum.perform({ token: "any_token" });

        expect(loadFacebookUserApi.loadUser).toHaveBeenCalledWith({token: "any_token"});
        expect(loadFacebookUserApi.loadUser).toHaveBeenCalledTimes(1)
    });

    it("should return AuthenticationError when loadFacebookUserApi returns undefined", async () => {
        const loadFacebookUserApi = {
            loadUser: jest.fn()
        }
        loadFacebookUserApi.loadUser.mockResolvedValueOnce(undefined)
        const sum = new FacebookAuthenticationService(loadFacebookUserApi);

        const authResult = await sum.perform({ token: "any_token" });

        expect(authResult).toEqual(new AuthenticationError());
    });
});

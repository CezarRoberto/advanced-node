import { AuthenticationError } from "@/domain/erros";
import { FacebookAuthentication } from "@/domain/features";
import { AcessToken } from "@/domain/models";
import { mock, MockProxy } from "jest-mock-extended";

class FacebookLoginController {
    constructor(
        private readonly facebookAuthentication: FacebookAuthentication
    ) {}
    async handle(httpRequest: any): Promise<HttpResponse> {
        try {
            if (httpRequest.token === "" || httpRequest.token === null ||httpRequest.token === undefined) {
                return {
                    statusCode: 400,
                    data: new Error("the field token is required"),
                };
            }
            const result = await this.facebookAuthentication.perform({
                token: httpRequest.token,
            });
            if (result instanceof AcessToken) {
                return {
                    statusCode: 200,
                    data: {
                        acessToken: result.value
                    },
                };
            } else {
                return {
                    statusCode: 401,
                    data: result,
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                data: new ServerError()
            }
        }
    }
}

type HttpResponse = {
    statusCode: number;
    data: any;
};
class ServerError extends Error {
    constructor(error?: Error) {
        super("Server failed. Try again soon");
        this.name = "ServerError";
        this.stack = error?.stack;
    }
}

describe("FacebookLoginController", () => {
    let sut: FacebookLoginController;
    let facebookAuth: MockProxy<FacebookAuthentication>;
    beforeAll(() => {
        facebookAuth = mock();
        facebookAuth.perform.mockResolvedValue(new AcessToken("any_value"));
    });
    beforeEach(() => {
        sut = new FacebookLoginController(facebookAuth);
    });
    it("should return 400 if token is empty", async () => {
        const httpResponse = await sut.handle({ token: "" });

        expect(httpResponse).toEqual({
            statusCode: 400,
            data: new Error("the field token is required"),
        });
    });

    it("should return 400 if token is null", async () => {
        const httpResponse = await sut.handle({ token: null });

        expect(httpResponse).toEqual({
            statusCode: 400,
            data: new Error("the field token is required"),
        });
    });

    it("should return 400 if token is undefined", async () => {
        const httpResponse = await sut.handle({ token: undefined });

        expect(httpResponse).toEqual({
            statusCode: 400,
            data: new Error("the field token is required"),
        });
    });

    it("should call FacebookAuthentication with correct params", async () => {
        await sut.handle({ token: "any_token" });

        expect(facebookAuth.perform).toHaveBeenCalledWith({
            token: "any_token",
        });

        expect(facebookAuth.perform).toHaveBeenCalledTimes(1);
    });

    it("should return 401 if authentication fails", async () => {
        facebookAuth.perform.mockResolvedValueOnce(new AuthenticationError());
        const httpResponse = await sut.handle({ token: "any_token" });

        expect(httpResponse).toEqual({
            statusCode: 401,
            data: new AuthenticationError(),
        });
    });

    it("should return 200 if authentication sucesseds", async () => {
        const httpResponse = await sut.handle({ token: "any_token" });

        expect(httpResponse).toEqual({
            statusCode: 200,
            data: {
                acessToken: "any_value",
            },
        });
    });

    it("should return 500 if authentication throws", async () => {
        const error = new Error("infra_error");
        facebookAuth.perform.mockRejectedValueOnce(error);
        const httpResponse = await sut.handle({ token: "any_token" });

        expect(httpResponse).toEqual({
            statusCode: 500,
            data: new ServerError(error),
        });
    });
});

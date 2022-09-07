import jwt from "jsonwebtoken";
import { JwtTokenGenerator } from "@/infra/crypto";

jest.mock("jsonwebtoken");

describe("JwtTokenGenerator", () => {
    let sut: JwtTokenGenerator;
    let fakeJwt: jest.Mocked<typeof jwt>;
    let jwtSecret: string;
    let key: string;
    let expirationInMs: number;
    let expirationInSeconds: number;
    beforeAll(() => {
        jwtSecret = "any_secret";
        (key = "any_key"), (expirationInMs = 1);
        expirationInSeconds = expirationInMs / 1000;
    });

    beforeEach(() => {
        fakeJwt = jwt as jest.Mocked<typeof jwt>;
        sut = new JwtTokenGenerator(jwtSecret);
        fakeJwt.sign.mockImplementation(() => "any_token");
    });

    it("should call sign with correct params", async () => {
        await sut.generateToken({ key, expirationInMs });

        expect(fakeJwt.sign).toHaveBeenCalledWith({ key }, "any_secret", {
            expiresIn: expirationInSeconds,
        });
    });

    it("should return a token", async () => {
        const token = await sut.generateToken({ key, expirationInMs });

        expect(token).toBe("any_token");
    });

    it("should rethrow if sing throw", async () => {
        fakeJwt.sign.mockImplementationOnce(() => {
            throw new Error("jwt_error");
        });
        const promise = sut.generateToken({ key, expirationInMs });

        expect(promise).rejects.toThrow(new Error("jwt_error"));
    });
});

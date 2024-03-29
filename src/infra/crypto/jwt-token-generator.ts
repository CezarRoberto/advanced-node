import { TokenGenerator } from "@/data/contracts/crypto";

import { sign } from "jsonwebtoken";

export class JwtTokenGenerator implements TokenGenerator {
    constructor(private readonly jwtSecret: string) {}

    async generateToken(
        params: TokenGenerator.Params
    ): Promise<TokenGenerator.Result> {
        const expirationInSeconds = params.expirationInMs / 1000;
        const token = sign({ key: params.key }, this.jwtSecret, {
            expiresIn: expirationInSeconds,
        });

        return token;
    }
}

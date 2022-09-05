import { AcessToken } from "@/domain/models";

describe('AcessToken', () => {
   it('should create with a value', () => {
    const sut = new AcessToken('any_value')

    expect(sut).toEqual({
        value: 'any_value'
    })
   });

   it('should expire in 1800000 ms', () => {

    expect(AcessToken.expirationInMs).toBe(1800000)
   });
});
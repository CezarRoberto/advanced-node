export class AcessToken {
  constructor ( private readonly value: string) {}

  static get expirationInMs (): number {
    return 30 * 60 * 1000
  }
}

/**
 * Pay Rate Guard — validates that an employee's pay rate
 * does not exceed the agreed maximum per the agent contract.
 */
export function validatePayRate(newRate: number, maxRate: number): void {
  if (newRate > maxRate) {
    throw new Error(
      `Pay rate C$${newRate.toFixed(2)}/hr exceeds the agreed maximum of C$${maxRate.toFixed(2)}/hr.`
    );
  }
}

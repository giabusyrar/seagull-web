import { describe, expect, it } from 'vitest';
import { customerFields, EMPTY_CUSTOMER } from './CustomerCard';

describe('customerFields', () => {
  it('sends the customer’s details in core’s field names, trimmed, leaving empty ones out', () => {
    expect(customerFields({ fullName: ' Sim ', email: '', phoneNumber: '0812', dateOfBirth: '1990-01-02' })).toEqual({
      full_name: 'Sim',
      phone_number: '0812',
      date_of_birth: '1990-01-02',
    });
  });

  it('sends nothing for an empty customer, and never a customer id', () => {
    expect(customerFields(EMPTY_CUSTOMER)).toEqual({});
  });
});

/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { describe, expect, it } from 'vitest'

import { getBillingDisplayExchangeRate } from '../currency'

describe('getBillingDisplayExchangeRate', () => {
  const base = {
    displayInCurrency: true,
    quotaPerUnit: 500000,
    usdExchangeRate: 7.3,
    customCurrencySymbol: '¥',
    customCurrencyExchangeRate: 1,
  }

  it('is 1 for USD display', () => {
    expect(
      getBillingDisplayExchangeRate({ ...base, quotaDisplayType: 'USD' })
    ).toBe(1)
  })

  it('is the USD exchange rate for CNY display', () => {
    expect(
      getBillingDisplayExchangeRate({ ...base, quotaDisplayType: 'CNY' })
    ).toBe(7.3)
  })

  it('is the custom exchange rate for CUSTOM display, not the USD rate', () => {
    expect(
      getBillingDisplayExchangeRate({
        ...base,
        quotaDisplayType: 'CUSTOM',
        customCurrencyExchangeRate: 1,
      })
    ).toBe(1)
    expect(
      getBillingDisplayExchangeRate({
        ...base,
        quotaDisplayType: 'CUSTOM',
        customCurrencyExchangeRate: 0.9,
      })
    ).toBe(0.9)
  })

  it('is 1 for TOKENS display because billing formatters fall back to USD', () => {
    expect(
      getBillingDisplayExchangeRate({ ...base, quotaDisplayType: 'TOKENS' })
    ).toBe(1)
  })
})

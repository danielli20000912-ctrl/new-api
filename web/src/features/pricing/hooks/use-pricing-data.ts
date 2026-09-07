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
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useStatus } from '@/hooks/use-status'
import { useSystemConfig } from '@/hooks/use-system-config'
import { getBillingDisplayExchangeRate } from '@/lib/currency'

import { getPricing } from '../api'

export function usePricingData(enabled = true) {
  const { status } = useStatus()
  const { currency } = useSystemConfig()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
    enabled,
  })

  // Ensure rates never reach zero to prevent division errors
  const priceRate = useMemo(
    () => Math.max((status?.price as number) ?? 1, 0.001),
    [status?.price]
  )
  // Recharge prices are `usd × priceRate` in local currency. The formatters
  // multiply USD amounts by the *display* exchange rate, so pre-divide by
  // that same rate (1 for USD, USD rate for CNY, custom rate for CUSTOM).
  // Using `status.usd_exchange_rate` here mis-scales CUSTOM currencies.
  const usdExchangeRate = useMemo(
    () => Math.max(getBillingDisplayExchangeRate(currency), 0.001),
    [currency]
  )
  // When one unit of credit costs exactly its displayed value, "Standard" and
  // "Recharge" print identical numbers and the switch only confuses users.
  const rechargePriceMatchesStandard =
    Math.abs(priceRate - usdExchangeRate) < 1e-9

  const models = useMemo(() => {
    if (!data?.data || !data?.vendors) return []

    const vendorMap = new Map(data.vendors.map((v) => [v.id, v]))

    return data.data.map((model) => {
      const vendor = model.vendor_id
        ? vendorMap.get(model.vendor_id)
        : undefined
      return {
        ...model,
        key: model.model_name,
        vendor_name: vendor?.name,
        vendor_icon: vendor?.icon,
        vendor_description: vendor?.description,
        group_ratio: data.group_ratio,
      }
    })
  }, [data])

  return {
    models,
    vendors: data?.vendors ?? [],
    groupRatio: data?.group_ratio ?? {},
    usableGroup: data?.usable_group ?? {},
    endpointMap: data?.supported_endpoint ?? {},
    autoGroups: data?.auto_groups ?? [],
    isLoading,
    error,
    refetch,
    priceRate,
    usdExchangeRate,
    rechargePriceMatchesStandard,
  }
}

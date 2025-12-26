'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Filter, X } from 'lucide-react'

interface FilterOptions {
  search?: string
  status?: string
  serviceId?: string
  dateFrom?: string
  dateTo?: string
}

interface AdvancedFiltersProps {
  onFilter: (filters: FilterOptions) => void
  services?: Array<{ id: string; name: string }>
  showSearch?: boolean
  showStatus?: boolean
  showService?: boolean
  showDateRange?: boolean
}

export function AdvancedFilters({
  onFilter,
  services = [],
  showSearch = true,
  showStatus = true,
  showService = true,
  showDateRange = true,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
    onFilter(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilter({})
  }

  const hasActiveFilters = Object.values(filters).some((v) => v)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="glow-gold-hover"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 bg-gold-500 text-black rounded-full text-xs">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          {showSearch && (
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                placeholder="Search..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="bg-gray-800"
              />
            </div>
          )}

          {showStatus && (
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          {showService && services.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Service</label>
              <select
                value={filters.serviceId || ''}
                onChange={(e) => handleFilterChange('serviceId', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="">All Services</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showDateRange && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">From Date</label>
                <Input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">To Date</label>
                <Input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="bg-gray-800"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}





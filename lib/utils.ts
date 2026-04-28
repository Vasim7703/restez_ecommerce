export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export const formatPincode = (pincode: string): string => {
  return pincode.replace(/\D/g, '').slice(0, 6)
}

export const validatePincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode)
}

export const checkPincodeServiceability = async (pincode: string): Promise<{
  serviceable: boolean
  deliveryDays?: number
}> => {
  // Simulated API call - replace with actual pincode API
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock logic: All Gujarat, Maharashtra, and Delhi NCR pincodes are serviceable
  const serviceablePrefixes = ['38', '39', '40', '41', '11', '12', '13', '14', '15']
  const isServiceable = serviceablePrefixes.some(prefix => pincode.startsWith(prefix))
  
  return {
    serviceable: isServiceable,
    deliveryDays: isServiceable ? Math.floor(Math.random() * 7) + 7 : undefined,
  }
}

export const generateOrderId = (): string => {
  return `RST${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
}

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

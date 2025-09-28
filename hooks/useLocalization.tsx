import { viLocale, getTranslation } from "@/locales/vi"

export const useLocalization = () => {
  const t = (key: string) => getTranslation(key, viLocale)

  return {
    t,
    locale: viLocale,
    formatCurrency: (amount: number) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount)
    },
    formatDate: (date: Date) => {
      return new Intl.DateTimeFormat("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date)
    },
    formatNumber: (number: number) => {
      return new Intl.NumberFormat("vi-VN").format(number)
    },
  }
}

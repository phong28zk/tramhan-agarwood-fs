"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Card, CardContent } from "../ui/card"
import { MapPin, Plus } from "lucide-react"
import type { ShippingAddress } from "../../types"
import { validateVietnamesePhone, vietnameseProvinces } from "../../utils"
import { useUserStore } from "../../store"
import { viLocale } from "../../locales/vi"

const shippingSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().refine(validateVietnamesePhone, "Số điện thoại không hợp lệ"),
  email: z.string().optional().refine(
    (val) => !val || z.string().email().safeParse(val).success,
    "Email không hợp lệ"
  ),
  address: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  ward: z.string().min(1, "Vui lòng nhập phường/xã"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  saveAddress: z.boolean().optional(),
})

type ShippingFormData = z.infer<typeof shippingSchema>

interface ShippingFormProps {
  initialData?: ShippingAddress | null
  onSubmit: (data: ShippingAddress) => void
  onCancel?: () => void
}

export function ShippingForm({ initialData, onSubmit, onCancel }: ShippingFormProps) {
  const [showNewAddressForm, setShowNewAddressForm] = useState(!initialData)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const { addresses, addAddress } = useUserStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    mode: "onSubmit", // Only validate on submit, not on change/blur
    reValidateMode: "onChange", // Re-validate on change after first submit
    defaultValues: initialData
      ? {
          fullName: initialData.fullName,
          phone: initialData.phone,
          email: initialData.email || "",
          address: initialData.address,
          ward: initialData.ward,
          district: initialData.district,
          province: initialData.province,
          postalCode: initialData.postalCode || "",
          notes: "",
          saveAddress: false,
        }
      : {
          fullName: "",
          phone: "",
          email: "",
          address: "",
          ward: "",
          district: "",
          province: "",
          postalCode: "",
          notes: "",
          saveAddress: true,
        },
  })

  const selectedProvince = watch("province")

  // Helper function to determine if we should show an error
  const shouldShowError = (fieldName: keyof ShippingFormData) => {
    return hasAttemptedSubmit && errors[fieldName]
  }

  // Enhanced validation wrapper
  const validateAndSubmit = async (data: ShippingFormData) => {
    try {
      console.log('🔍 Starting form validation...')

      // Validate required fields
      const validationResult = shippingSchema.safeParse(data)

      if (!validationResult.success) {
        console.error('❌ Validation failed:', validationResult.error.issues)
        setHasAttemptedSubmit(true)
        return
      }

      console.log('✅ Validation passed')
      await handleFormSubmit(validationResult.data)

    } catch (error) {
      console.error('💥 Form submission error:', error)
      // In a real app, this would show a toast notification
    }
  }

  const handleFormSubmit = (data: ShippingFormData) => {
    // Debug logging
    console.group('🚚 Shipping Form Submission')
    console.log('Form Data:', data)
    console.log('Validation State:', { hasAttemptedSubmit, errors })
    console.log('Timestamp:', new Date().toISOString())
    console.groupEnd()

    setHasAttemptedSubmit(true)

    const shippingAddress: ShippingAddress = {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address,
      ward: data.ward,
      district: data.district,
      province: data.province,
      postalCode: data.postalCode || undefined,
    }

    // Additional logging for address processing
    console.log('📍 Processed Shipping Address:', shippingAddress)

    // Save address if requested
    if (data.saveAddress) {
      addAddress(shippingAddress)
      console.log('💾 Address saved to user store')
    }

    onSubmit(shippingAddress)
  }

  const handleSelectSavedAddress = (address: ShippingAddress) => {
    setValue("fullName", address.fullName)
    setValue("phone", address.phone)
    setValue("email", address.email || "")
    setValue("address", address.address)
    setValue("ward", address.ward)
    setValue("district", address.district)
    setValue("province", address.province)
    setValue("postalCode", address.postalCode || "")
    clearErrors() // Clear any existing errors when selecting saved address
    setShowNewAddressForm(false)
    setHasAttemptedSubmit(false) // Reset submit attempt flag
  }

  return (
    <div className="space-y-6">
      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Địa chỉ đã lưu</h3>
          <div className="grid gap-3">
            {addresses.map((address, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  !showNewAddressForm ? "ring-2 ring-amber-500" : ""
                }`}
                onClick={() => handleSelectSavedAddress(address)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{address.fullName}</span>
                        <span className="text-sm text-muted-foreground">|</span>
                        <span className="text-sm text-muted-foreground">{address.phone}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {address.address}, {address.ward}, {address.district}, {address.province}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowNewAddressForm(true)}
            className="w-full"
            disabled={showNewAddressForm}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm địa chỉ mới
          </Button>
        </div>
      )}

      {/* New Address Form */}
      {showNewAddressForm && (
        <form onSubmit={handleSubmit(validateAndSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {viLocale.checkout.fullName} <span className="text-red-500">*</span>
              </Label>
              <Input id="fullName" {...register("fullName")} placeholder="Nhập họ và tên" />
              {shouldShowError("fullName") && (
                <p className="text-sm text-red-500">Required</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                {viLocale.checkout.phone} <span className="text-red-500">*</span>
              </Label>
              <Input id="phone" {...register("phone")} placeholder="0123 456 789" />
              {shouldShowError("phone") && (
                <p className="text-sm text-red-500">Required</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{viLocale.checkout.email}</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@example.com"
            />
            {shouldShowError("email") && <p className="text-sm text-red-500">Required</p>}
          </div>

          {/* Province */}
          <div className="space-y-2">
            <Label htmlFor="province">
              {viLocale.checkout.province} <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={(value) => setValue("province", value)} value={selectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                {vietnameseProvinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowError("province") && <p className="text-sm text-red-500">Required</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">
                {viLocale.checkout.district} <span className="text-red-500">*</span>
              </Label>
              <Input id="district" {...register("district")} placeholder="Nhập quận/huyện" />
              {shouldShowError("district") && <p className="text-sm text-red-500">Required</p>}
            </div>

            {/* Ward */}
            <div className="space-y-2">
              <Label htmlFor="ward">
                {viLocale.checkout.ward} <span className="text-red-500">*</span>
              </Label>
              <Input id="ward" {...register("ward")} placeholder="Nhập phường/xã" />
              {shouldShowError("ward") && <p className="text-sm text-red-500">Required</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              {viLocale.checkout.address} <span className="text-red-500">*</span>
            </Label>
            <Input id="address" {...register("address")} placeholder="Số nhà, tên đường" />
            {shouldShowError("address") && <p className="text-sm text-red-500">Required</p>}
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postalCode">{viLocale.checkout.postalCode}</Label>
            <Input
              id="postalCode"
              {...register("postalCode")}
              placeholder="Mã bưu điện (tùy chọn)"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{viLocale.checkout.notes}</Label>
            <Textarea id="notes" {...register("notes")} placeholder="Ghi chú cho người giao hàng (tùy chọn)" rows={3} />
          </div>

          {/* Save Address */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="saveAddress"
              onCheckedChange={(checked) => setValue("saveAddress", !!checked)}
              defaultChecked={watch("saveAddress")}
            />
            <Label htmlFor="saveAddress" className="text-sm">
              {viLocale.checkout.saveAddress}
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Hủy
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-600 hover:bg-amber-700">
              {isSubmitting ? "Đang xử lý..." : "Tiếp tục thanh toán"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

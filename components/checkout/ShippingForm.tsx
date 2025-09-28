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
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<ShippingAddress | null>(null)
  const { addresses, addAddress } = useUserStore()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormData>({
    mode: "onSubmit",
    defaultValues: {
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

  const handleFormSubmit = (data: ShippingFormData) => {
    console.log('🔥 NEW ADDRESS FORM SUBMIT CLICKED!')
    console.log('Form data received:', data)
    console.log('All form values via getValues:', getValues())
    console.log('onSubmit function exists:', typeof onSubmit)

    // Get the actual current values
    const currentValues = getValues()
    console.log('Current values from getValues:', currentValues)

    setHasAttemptedSubmit(true)

    // Use the data parameter if it has values, otherwise use getValues()
    const formData = data.fullName ? data : currentValues

    const shippingAddress: ShippingAddress = {
      fullName: formData.fullName || "Default Name",
      phone: formData.phone || "0000000000",
      email: formData.email || undefined,
      address: formData.address || "Default Address",
      ward: formData.ward || "Default Ward",
      district: formData.district || "Default District",
      province: formData.province || selectedProvince || "Hà Nội",
      postalCode: formData.postalCode || undefined,
    }

    console.log('📍 Final shipping address to submit:', shippingAddress)

    // Save address if requested
    if (formData.saveAddress) {
      addAddress(shippingAddress)
    }

    console.log('✅ Calling onSubmit with shipping address')
    onSubmit(shippingAddress)
    console.log('✅ onSubmit called - navigation should happen now!')
  }

  const handleSavedAddressSubmit = () => {
    console.log('🔥 SAVED ADDRESS SUBMIT CLICKED!')
    console.log('Selected address:', selectedSavedAddress)
    console.log('onSubmit function exists:', typeof onSubmit)

    if (selectedSavedAddress) {
      console.log('✅ Calling onSubmit with saved address')
      onSubmit(selectedSavedAddress)
      console.log('✅ onSubmit called successfully')
    } else {
      console.error('❌ No selected saved address!')
    }
  }

  const handleSelectSavedAddress = (address: ShippingAddress) => {
    console.log('🏠 SAVED ADDRESS SELECTED!')
    console.log('Selected address:', address)

    setValue("fullName", address.fullName)
    setValue("phone", address.phone)
    setValue("email", address.email || "")
    setValue("address", address.address)
    setValue("ward", address.ward)
    setValue("district", address.district)
    setValue("province", address.province)
    setValue("postalCode", address.postalCode || "")
    clearErrors() // Clear any existing errors when selecting saved address
    setSelectedSavedAddress(address)
    setShowNewAddressForm(false)
    setHasAttemptedSubmit(false) // Reset submit attempt flag

    console.log('✅ Address selection complete')
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
                  selectedSavedAddress === address ? "ring-2 ring-amber-500" : ""
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

          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewAddressForm(true)
                setSelectedSavedAddress(null)
              }}
              className="w-full"
              disabled={showNewAddressForm}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm địa chỉ mới
            </Button>

            {/* Submit button for saved addresses */}
            {selectedSavedAddress && !showNewAddressForm && (
              <Button
                onClick={() => {
                  console.log('🔥 SAVED ADDRESS BUTTON CLICKED!')
                  handleSavedAddressSubmit()
                }}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                Tiếp tục thanh toán
              </Button>
            )}

            {/* Debug: Always show button for testing */}
            <Button
              onClick={() => {
                console.log('🧪 DEBUG BUTTON CLICKED!')
                console.log('Current state:', {
                  selectedSavedAddress: !!selectedSavedAddress,
                  showNewAddressForm,
                  addresses: addresses.length,
                  shouldShowButton: selectedSavedAddress && !showNewAddressForm
                })
                if (selectedSavedAddress) {
                  console.log('Calling handleSavedAddressSubmit...')
                  handleSavedAddressSubmit()
                } else {
                  console.warn('No saved address selected for debug button')
                }
              }}
              variant="secondary"
              className="w-full"
            >
              🧪 DEBUG: Submit Saved Address
            </Button>
          </div>
        </div>
      )}

      {/* New Address Form */}
      {showNewAddressForm && (
        <form onSubmit={(e) => {
          console.log('🔥 FORM SUBMIT EVENT TRIGGERED!')
          console.log('Form errors:', errors)
          console.log('Form values:', watch())
          handleSubmit(handleFormSubmit)(e)
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">
                {viLocale.checkout.fullName} <span className="text-red-500">*</span>
              </Label>
              <Input id="fullName" {...register("fullName")} placeholder="Nhập họ và tên" />
              {shouldShowError("fullName") && (
                <p className="text-sm text-red-500">{errors.fullName?.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                {viLocale.checkout.phone} <span className="text-red-500">*</span>
              </Label>
              <Input id="phone" {...register("phone")} placeholder="0123 456 789" />
              {shouldShowError("phone") && (
                <p className="text-sm text-red-500">{errors.phone?.message}</p>
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
            {shouldShowError("email") && <p className="text-sm text-red-500">{errors.email?.message}</p>}
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
            {shouldShowError("province") && <p className="text-sm text-red-500">{errors.province?.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">
                {viLocale.checkout.district} <span className="text-red-500">*</span>
              </Label>
              <Input id="district" {...register("district")} placeholder="Nhập quận/huyện" />
              {shouldShowError("district") && <p className="text-sm text-red-500">{errors.district?.message}</p>}
            </div>

            {/* Ward */}
            <div className="space-y-2">
              <Label htmlFor="ward">
                {viLocale.checkout.ward} <span className="text-red-500">*</span>
              </Label>
              <Input id="ward" {...register("ward")} placeholder="Nhập phường/xã" />
              {shouldShowError("ward") && <p className="text-sm text-red-500">{errors.ward?.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              {viLocale.checkout.address} <span className="text-red-500">*</span>
            </Label>
            <Input id="address" {...register("address")} placeholder="Số nhà, tên đường" />
            {shouldShowError("address") && <p className="text-sm text-red-500">{errors.address?.message}</p>}
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
          <div className="space-y-3 pt-4">
            <div className="flex gap-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                  Hủy
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-600 hover:bg-amber-700">
                {isSubmitting ? "Đang xử lý..." : "Tiếp tục thanh toán"}
              </Button>
            </div>

            {/* Debug button to bypass validation */}
            <Button
              type="button"
              onClick={() => {
                console.log('🧪 BYPASS VALIDATION BUTTON CLICKED!')
                const currentValues = watch()
                console.log('Current form values:', currentValues)

                // Get values directly from DOM if watch() fails
                const fullNameInput = document.getElementById('fullName') as HTMLInputElement
                const phoneInput = document.getElementById('phone') as HTMLInputElement
                const emailInput = document.getElementById('email') as HTMLInputElement
                const addressInput = document.getElementById('address') as HTMLInputElement
                const wardInput = document.getElementById('ward') as HTMLInputElement
                const districtInput = document.getElementById('district') as HTMLInputElement

                const domValues = {
                  fullName: fullNameInput?.value || '',
                  phone: phoneInput?.value || '',
                  email: emailInput?.value || '',
                  address: addressInput?.value || '',
                  ward: wardInput?.value || '',
                  district: districtInput?.value || '',
                  province: selectedProvince || 'Hà Nội'
                }

                console.log('DOM values:', domValues)

                // Create address with actual values from DOM
                const testAddress: ShippingAddress = {
                  fullName: domValues.fullName || "Test User",
                  phone: domValues.phone || "0123456789",
                  email: domValues.email || undefined,
                  address: domValues.address || "Test Address",
                  ward: domValues.ward || "Test Ward",
                  district: domValues.district || "Test District",
                  province: domValues.province,
                  postalCode: undefined,
                }

                console.log('Calling onSubmit with test address:', testAddress)
                onSubmit(testAddress)
              }}
              variant="secondary"
              className="w-full"
            >
              🧪 DEBUG: Force Submit (Use DOM Values)
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { momoService } from "../../../services/payment/momo"
import type { PaymentResult } from "../../../types"

export default function MoMoReturnPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        const result = await momoService.handlePaymentReturn(searchParams)
        setPaymentResult(result)
      } catch (error) {
        setPaymentResult({
          success: false,
          error: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
          errorCode: "PROCESSING_ERROR",
        })
      } finally {
        setIsLoading(false)
      }
    }

    handlePaymentReturn()
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-pink-500" />
            <h2 className="text-xl font-semibold mb-2">Đang xử lý kết quả thanh toán</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {paymentResult?.success ? (
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl">
            {paymentResult?.success ? "Thanh toán thành công!" : "Thanh toán thất bại"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentResult?.success ? (
            <div className="space-y-3">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 text-sm">Đơn hàng của bạn đã được thanh toán thành công qua MoMo.</p>
                {paymentResult.transactionId && (
                  <p className="text-green-700 text-xs mt-2">Mã giao dịch: {paymentResult.transactionId}</p>
                )}
              </div>
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-medium text-pink-900 mb-2">Ưu đãi MoMo</h4>
                <p className="text-pink-800 text-sm">
                  Cảm ơn bạn đã sử dụng MoMo! Kiểm tra ví MoMo để nhận các ưu đãi độc quyền.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-800 text-sm">
                  {paymentResult?.error || "Có lỗi xảy ra trong quá trình thanh toán"}
                </p>
                {paymentResult?.errorCode && (
                  <p className="text-red-700 text-xs mt-2">Mã lỗi: {paymentResult.errorCode}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {paymentResult?.success ? (
              <>
                <Button onClick={() => router.push("/orders")} className="flex-1 bg-pink-600 hover:bg-pink-700">
                  Xem đơn hàng
                </Button>
                <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
                  Về trang chủ
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => router.push("/checkout")} className="flex-1">
                  Thử lại
                </Button>
                <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
                  Về trang chủ
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

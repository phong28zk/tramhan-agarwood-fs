"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function VNPayReturnPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string
    amount: string
    transactionNo: string
    bankCode: string
  } | null>(null)

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode")
    const orderId = searchParams.get("vnp_TxnRef")
    const amount = searchParams.get("vnp_Amount")
    const transactionNo = searchParams.get("vnp_TransactionNo")
    const bankCode = searchParams.get("vnp_BankCode")

    if (responseCode === "00") {
      setStatus("success")
      setMessage("Thanh toán thành công!")
      setOrderInfo({
        orderId: orderId || "",
        amount: amount ? (parseInt(amount) / 100).toLocaleString("vi-VN") : "0",
        transactionNo: transactionNo || "",
        bankCode: bankCode || "",
      })
    } else {
      setStatus("error")
      setMessage(getErrorMessage(responseCode || "99"))
    }
  }, [searchParams])

  const getErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      "07": "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).",
      "09": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.",
      "10": "Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
      "11": "Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.",
      "12": "Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.",
      "13": "Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).",
      "24": "Giao dịch không thành công do: Khách hàng hủy giao dịch",
      "51": "Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.",
      "65": "Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì.",
      "79": "Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.",
      "99": "Các lỗi khác",
    }
    return messages[code] || "Lỗi không xác định"
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardContent className="p-8">
          {status === "loading" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-amber-600 mx-auto" />
              <h2 className="text-2xl font-semibold">Đang xử lý giao dịch...</h2>
            </div>
          )}

          {status === "success" && (
            <div className="text-center space-y-6">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-semibold text-green-600 mb-2">{message}</h2>
                <p className="text-gray-600">Cảm ơn bạn đã mua hàng!</p>
              </div>

              {orderInfo && (
                <div className="bg-gray-50 p-6 rounded-lg text-left space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Thông tin giao dịch</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-gray-600">Mã đơn hàng:</div>
                    <div className="font-medium">{orderInfo.orderId}</div>

                    <div className="text-gray-600">Số tiền:</div>
                    <div className="font-medium">{orderInfo.amount} VND</div>

                    <div className="text-gray-600">Mã giao dịch:</div>
                    <div className="font-medium">{orderInfo.transactionNo}</div>

                    <div className="text-gray-600">Ngân hàng:</div>
                    <div className="font-medium">{orderInfo.bankCode}</div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button onClick={() => router.push("/orders")} className="flex-1">
                  Xem đơn hàng
                </Button>
                <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
                  Về trang chủ
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <XCircle className="h-16 w-16 text-red-600 mx-auto" />
              <div>
                <h2 className="text-2xl font-semibold text-red-600 mb-2">Thanh toán không thành công</h2>
                <p className="text-gray-600">{message}</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => router.push("/checkout")} className="flex-1">
                  Thử lại
                </Button>
                <Button onClick={() => router.push("/")} variant="outline" className="flex-1">
                  Về trang chủ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

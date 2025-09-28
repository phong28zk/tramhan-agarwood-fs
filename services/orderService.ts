import type { Order } from "../types"

// Mock order storage - in a real app, this would connect to a database
const orders: Map<string, Order> = new Map()

export async function getOrderById(orderId: string): Promise<Order | null> {
  return orders.get(orderId) || null
}

export async function createOrder(order: Order): Promise<Order> {
  orders.set(order.id, order)
  return order
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<Order | null> {
  const order = orders.get(orderId)
  if (!order) return null

  order.status = status
  order.updatedAt = new Date()
  orders.set(orderId, order)
  return order
}

export async function getAllOrders(): Promise<Order[]> {
  return Array.from(orders.values())
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  return orders.delete(orderId)
}

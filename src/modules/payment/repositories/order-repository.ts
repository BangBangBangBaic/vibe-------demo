import type { OrderEntity } from "../types";

export class OrderRepository {
  private readonly orders = new Map<string, OrderEntity>();

  public save(order: OrderEntity): void {
    this.orders.set(order.orderNo, order);
  }

  public findByOrderNo(orderNo: string): OrderEntity | null {
    const order = this.orders.get(orderNo);
    return order ?? null;
  }

  public update(order: OrderEntity): void {
    this.orders.set(order.orderNo, order);
  }
}

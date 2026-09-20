import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN']);
export type Role = z.infer<typeof RoleEnum>;

export const VehicleStatusEnum = z.enum([
  'AVAILABLE',
  'RESERVED',
  'SOLD',
  'DELIVERED',
  'DOCS_PENDING',
  // "Rascunho" — em inventário mas ainda não comercializável (preço por
  // definir). Tipicamente criado quando entra uma retoma STOCK.
  'DRAFT',
]);
export type VehicleStatus = z.infer<typeof VehicleStatusEnum>;

export const FuelEnum = z.enum([
  'GASOLINE',
  'DIESEL',
  'HYBRID',
  'PLUGIN_HYBRID',
  'ELECTRIC',
  'LPG',
]);
export type Fuel = z.infer<typeof FuelEnum>;

export const VehicleExpenseCategoryEnum = z.enum([
  'ACQUISITION',
  'REPAIR',
  'INSPECTION',
  'TRANSPORT',
  'CLEANING',
  'DOCS',
  'OTHER',
]);
export type VehicleExpenseCategory = z.infer<typeof VehicleExpenseCategoryEnum>;

export const OpExpenseCategoryEnum = z.enum(['RENT', 'BILLS', 'SERVICES', 'OTHER']);
export type OpExpenseCategory = z.infer<typeof OpExpenseCategoryEnum>;

export const DeliveryStatusEnum = z.enum(['PENDING', 'SCHEDULED', 'DELIVERED']);
export type DeliveryStatus = z.infer<typeof DeliveryStatusEnum>;

export const BuyerTypeEnum = z.enum(['PARTICULAR', 'COMERCIANTE']);
export type BuyerType = z.infer<typeof BuyerTypeEnum>;

export const TradeInDispositionEnum = z.enum(['STOCK', 'SCRAP']);
export type TradeInDisposition = z.infer<typeof TradeInDispositionEnum>;

export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const PriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type Priority = z.infer<typeof PriorityEnum>;

export const RecurrenceEnum = z.enum(['NONE', 'WEEKLY', 'MONTHLY', 'ANNUAL']);
export type Recurrence = z.infer<typeof RecurrenceEnum>;

export const ActivityTypeEnum = z.enum([
  'VEHICLE_ADDED',
  'VEHICLE_UPDATED',
  'VEHICLE_STATUS_CHANGED',
  'VEHICLE_DELETED',
  'SALE_CREATED',
  'SALE_UPDATED',
  'TRADE_IN_RECEIVED',
  'CUSTOMER_ADDED',
  'CUSTOMER_UPDATED',
  'TASK_CREATED',
  'TASK_STATUS_CHANGED',
  'TASK_COMPLETED',
  'EXPENSE_ADDED',
  'EXPENSE_UPDATED',
]);
export type ActivityType = z.infer<typeof ActivityTypeEnum>;

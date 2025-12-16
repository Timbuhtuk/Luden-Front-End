// Types based on Swagger documentation

export interface UserDto {
  id: number;
  username: string | null;
  email: string | null;
  role: string | null;
  bonusPoints: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UserProfileDTO {
  username: string | null;
  email: string | null;
  role: string | null;
  bonusPoints: number;
  createdAt: string;
  updatedAt?: string | null;
  avatarUrl?: string | null;
  bills?: BillDto[] | null;
  products?: ProductDto[] | null;
}

export interface UserLoginDTO {
  email?: string | null;
  password?: string | null;
  googleJwtToken?: string | null;
}

export interface UserRegisterDTO {
  name?: string | null;
  email?: string | null;
  password?: string | null;
  googleJwtToken?: string | null;
}

export interface ProductDto {
  id: number;
  name: string | null;
  description: string | null;
  price: number;
  stock: number;
  regionId?: number | null;
  region?: Region | null;
  createdAt: string;
  updatedAt?: string | null;
  coverUrl?: string | null;
  files?: ProductFileDto[] | null;
  licenses?: License[] | null;
  discountPercentage?: number;
  developer?: string;
  publisher?: string;
  category?: string;
  releaseDate?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  regionId: number;
}

export interface UpdateProductDto {
  name?: string | null;
  description?: string | null;
  price?: number | null;
  stock?: number | null;
  regionId?: number | null;
}

export interface BillDto {
  id: number;
  createdAt: string;
  updatedAt?: string | null;
  totalAmount: number;
  status: string | null;
  billItems?: BillItemDto[] | null;
}

export interface BillItemDto {
  id: number;
  quantity: number;
  price: number;
  product?: ProductDto | null;
}

export interface BillCreateDto {
  userId: number;
  totalAmount: number;
  status: BillStatus;
  currency?: string | null;
  bonusPointsUsed?: number;
  items?: Array<{ productId: number; quantity: number; price: number }> | null;
}

export interface BillUpdateDto {
  id: number;
  userId: number;
  currency?: string | null;
  totalAmount: number;
  status: BillStatus;
  createdAt: string;
  updatedAt?: string | null;
}

export type BillStatus = 'Pending' | 'Paid' | 'Cancelled' | 'Refunded' | 'Processing' | 'Completed';

export interface ProductFileDto {
  id: number;
  path?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  userId?: number | null;
  productId?: number | null;
  url?: string | null;
  // Дополнительные поля, которые могут приходить с бэкенда, но не описаны в Swagger
  fileType?: string | null;
  displayOrder?: number | null;
}

export interface PhotoFile {
  id: number;
  path?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  userId?: number | null;
  productId?: number | null;
  createdAt: string;
  updatedAt?: string | null;
  // Дополнительные поля, которые могут приходить с бэкенда, но не описаны в Swagger
  fileCategory?: string | null;
}

export interface License {
  id: number;
  productId: number;
  billItemId: number;
  licenseKey?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  expiresAt?: string | null;
}

export interface Region {
  id: number;
  name?: string | null;
  code?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface UpdatePaymentRequest {
  paymentIntentId?: string | null;
  paymentMethod?: string | null;
  action?: string | null;
}

export interface FavoriteDto {
  id: number;
  userId: number;
  product?: ProductDto | null;
  createdAt: string;
}


import { createApi } from '@reduxjs/toolkit/query/react';
import { rtkBaseQuery } from './rtkBaseQuery';
import { API_ENDPOINTS } from '@shared/config';
import type {
  UserDto,
  UserProfileDTO,
  UserLoginDTO,
  UserRegisterDTO,
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  BillDto,
  BillCreateDto,
  BillUpdateDto,
  ProductFileDto,
  PhotoFile,
  UpdatePaymentRequest,
  FavoriteDto,
} from '@shared/types';

/**
 * Централизованный RTK Query API для всех запросов
 */
export const rtkApi = createApi({
  reducerPath: 'rtkApi',
  baseQuery: rtkBaseQuery,
  tagTypes: ['User', 'Product', 'Bill', 'License', 'File', 'Payment', 'Favorite'],
  endpoints: (builder) => ({
    // ==================== Authorization ====================
    login: builder.mutation<{ token?: string; message?: string }, UserLoginDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.authorization.login,
        method: 'POST',
        body: data,
        withAuth: false,
      }),
    }),

    register: builder.mutation<{ token?: string; message?: string }, UserRegisterDTO>({
      query: (data) => ({
        url: API_ENDPOINTS.authorization.register,
        method: 'POST',
        body: data,
        withAuth: false,
      }),
    }),

    // ==================== User ====================
    getUsers: builder.query<UserDto[], void>({
      query: () => ({
        url: API_ENDPOINTS.user.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'User', id: 'LIST' }],
    }),

    getUserById: builder.query<UserDto, number>({
      query: (id) => ({
        url: API_ENDPOINTS.user.byId(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    getUserProfile: builder.query<UserProfileDTO, void>({
      query: () => ({
        url: API_ENDPOINTS.user.profile,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'User', id: 'PROFILE' }],
    }),

    getUserProfileById: builder.query<UserProfileDTO, number>({
      query: (id) => ({
        url: API_ENDPOINTS.user.profileById(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'User', id: `PROFILE-${id}` }],
    }),

    getUserProducts: builder.query<ProductDto[], void>({
      query: () => ({
        url: API_ENDPOINTS.user.products,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Product', id: 'USER-PRODUCTS' }],
    }),

    updateUser: builder.mutation<{ username: string; email: string; avatarUrl?: string }, FormData>({
      query: (formData) => ({
        url: API_ENDPOINTS.user.update,
        method: 'PUT',
        body: formData,
        withAuth: true,
        bodyType: 'form',
      }),
      invalidatesTags: [{ type: 'User', id: 'PROFILE' }, { type: 'User', id: 'LIST' }],
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.user.delete(id),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // ==================== Product ====================
    getProducts: builder.query<ProductDto[], void>({
      query: () => ({
        url: API_ENDPOINTS.product.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    getProductById: builder.query<ProductDto, number>({
      query: (id) => ({
        url: API_ENDPOINTS.product.byId(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    createProduct: builder.mutation<ProductDto, CreateProductDto>({
      query: (data) => ({
        url: API_ENDPOINTS.product.create,
        method: 'POST',
        body: data,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }],
    }),

    updateProduct: builder.mutation<ProductDto, { id: number; data: UpdateProductDto }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.product.update(id),
        method: 'PUT',
        body: data,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.product.delete(id),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    setProductCover: builder.mutation<ProductDto, { id: number; coverFileId: number }>({
      query: ({ id, coverFileId }) => ({
        url: API_ENDPOINTS.product.setCover(id, coverFileId),
        method: 'PUT',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
      ],
    }),

    // ==================== Bill ====================
    getBills: builder.query<BillDto[], void>({
      query: () => ({
        url: API_ENDPOINTS.bill.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Bill', id: 'LIST' }],
    }),

    getBillById: builder.query<BillDto, number>({
      query: (id) => ({
        url: API_ENDPOINTS.bill.byId(id),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, id) => [{ type: 'Bill', id }],
    }),

    getUserBills: builder.query<BillDto[], void>({
      query: () => ({
        url: API_ENDPOINTS.bill.user,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Bill', id: 'USER-LIST' }],
    }),

    createBill: builder.mutation<BillDto, BillCreateDto>({
      query: (data) => ({
        url: API_ENDPOINTS.bill.create,
        method: 'POST',
        body: data,
        withAuth: true,
      }),
      invalidatesTags: [
        { type: 'Bill', id: 'LIST' },
        { type: 'Bill', id: 'USER-LIST' },
      ],
    }),

    updateBill: builder.mutation<void, { id: number; data: BillUpdateDto }>({
      query: ({ id, data }) => ({
        url: API_ENDPOINTS.bill.byId(id),
        method: 'PUT',
        body: data,
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Bill', id },
        { type: 'Bill', id: 'LIST' },
        { type: 'Bill', id: 'USER-LIST' },
      ],
    }),

    deleteBill: builder.mutation<void, number>({
      query: (id) => ({
        url: API_ENDPOINTS.bill.byId(id),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Bill', id },
        { type: 'Bill', id: 'LIST' },
        { type: 'Bill', id: 'USER-LIST' },
      ],
    }),

    // ==================== File ====================
    getProductFiles: builder.query<ProductFileDto[], number>({
      query: (productId) => ({
        url: API_ENDPOINTS.file.productFiles(productId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, productId) => [{ type: 'File', id: `PRODUCT-${productId}` }],
    }),

    getProductFileById: builder.query<ProductFileDto, number>({
      query: (fileId) => ({
        url: API_ENDPOINTS.file.productFileById(fileId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, fileId) => [{ type: 'File', id: fileId }],
    }),

    uploadProductFile: builder.mutation<ProductFileDto, { productId: number; formData: FormData }>({
      query: ({ productId, formData }) => ({
        url: API_ENDPOINTS.file.uploadProductFile(productId),
        method: 'POST',
        body: formData,
        withAuth: true,
        bodyType: 'form',
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'File', id: `PRODUCT-${productId}` }],
    }),

    uploadProductFilesBulk: builder.mutation<void, { productId: number; formData: FormData }>({
      query: ({ productId, formData }) => ({
        url: API_ENDPOINTS.file.uploadProductFilesBulk(productId),
        method: 'POST',
        body: formData,
        withAuth: true,
        bodyType: 'form',
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'File', id: `PRODUCT-${productId}` }],
    }),

    deleteProductFile: builder.mutation<void, number>({
      query: (fileId) => ({
        url: API_ENDPOINTS.file.deleteProductFile(fileId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, fileId) => [{ type: 'File', id: fileId }],
    }),

    getPhotoFile: builder.query<PhotoFile, number>({
      query: (photoId) => ({
        url: API_ENDPOINTS.file.photoFile(photoId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, photoId) => [{ type: 'File', id: `PHOTO-${photoId}` }],
    }),

    deletePhotoFile: builder.mutation<void, number>({
      query: (photoId) => ({
        url: API_ENDPOINTS.file.deletePhotoFile(photoId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: (_result, _error, photoId) => [{ type: 'File', id: `PHOTO-${photoId}` }],
    }),

    // ==================== Blob/Image ====================
    getBlob: builder.query<Blob, { id: number; redirect?: boolean; dataUri?: boolean }>({
      query: ({ id, redirect, dataUri }) => ({
        url: API_ENDPOINTS.blob.image(id),
        method: 'GET',
        withAuth: false,
        params: {
          ...(redirect !== undefined ? { redirect: redirect.toString() } : {}),
          ...(dataUri !== undefined ? { dataUri: dataUri.toString() } : {}),
        },
      }),
    }),

    // ==================== Favorite ====================
    getFavorites: builder.query<FavoriteDto[], void>({
      query: () => ({
        url: API_ENDPOINTS.favorite.list,
        method: 'GET',
        withAuth: true,
      }),
      providesTags: [{ type: 'Favorite', id: 'LIST' }],
    }),

    checkFavorite: builder.query<boolean, number>({
      query: (productId) => ({
        url: API_ENDPOINTS.favorite.check(productId),
        method: 'GET',
        withAuth: true,
      }),
      providesTags: (_result, _error, productId) => [{ type: 'Favorite', id: `CHECK-${productId}` }],
    }),

    addFavorite: builder.mutation<FavoriteDto, number>({
      query: (productId) => ({
        url: API_ENDPOINTS.favorite.add(productId),
        method: 'POST',
        withAuth: true,
      }),
      invalidatesTags: [
        { type: 'Favorite', id: 'LIST' },
        (_result, _error, productId) => ({ type: 'Favorite', id: `CHECK-${productId}` }),
      ],
    }),

    removeFavorite: builder.mutation<void, number>({
      query: (productId) => ({
        url: API_ENDPOINTS.favorite.remove(productId),
        method: 'DELETE',
        withAuth: true,
      }),
      invalidatesTags: [
        { type: 'Favorite', id: 'LIST' },
        (_result, _error, productId) => ({ type: 'Favorite', id: `CHECK-${productId}` }),
      ],
    }),

    // ==================== Payment ====================
    createStripePayment: builder.mutation<void, number>({
      query: (billId) => ({
        url: API_ENDPOINTS.payment.stripeCreate,
        method: 'POST',
        body: billId,
        withAuth: true,
        bodyType: 'raw', // Отправляем число напрямую как JSON
      }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }],
    }),

    updatePaymentStatus: builder.mutation<void, UpdatePaymentRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.payment.stripeUpdateStatus,
        method: 'POST',
        body: data,
        withAuth: true,
      }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }],
    }),

    completePayment: builder.mutation<void, string>({
      query: (paymentIntentId) => ({
        url: API_ENDPOINTS.payment.stripeComplete,
        method: 'POST',
        body: paymentIntentId,
        withAuth: true,
        bodyType: 'raw', // Отправляем строку напрямую как JSON
      }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Authorization
  useLoginMutation,
  useRegisterMutation,
  // User
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserProfileQuery,
  useGetUserProfileByIdQuery,
  useGetUserProductsQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  // Product
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSetProductCoverMutation,
  // Bill
  useGetBillsQuery,
  useGetBillByIdQuery,
  useGetUserBillsQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  // File
  useGetProductFilesQuery,
  useGetProductFileByIdQuery,
  useUploadProductFileMutation,
  useUploadProductFilesBulkMutation,
  useDeleteProductFileMutation,
  useGetPhotoFileQuery,
  useDeletePhotoFileMutation,
  // Blob
  useGetBlobQuery,
  // Favorite
  useGetFavoritesQuery,
  useCheckFavoriteQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  // Payment
  useCreateStripePaymentMutation,
  useUpdatePaymentStatusMutation,
  useCompletePaymentMutation,
} = rtkApi;


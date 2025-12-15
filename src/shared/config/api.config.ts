export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const baseDomain = "https://Localhost:5195/api/";

export const API_ENDPOINTS = {
    authorization: {
        register: '/Authorization/register',
        login: '/Authorization/login',
    },
    bill: {
        list: '/Bill',
        create: '/Bill',
        byId: (id: number) => `/Bill/${id}`,
        user: '/Bill/user',
    },
    product: {
        list: '/Product',
        create: '/Product',
        byId: (id: number) => `/Product/${id}`,
        update: (id: number) => `/Product/${id}`,
        delete: (id: number) => `/Product/${id}`,
        setCover: (id: number, coverFileId: number) => `/Product/${id}/cover/${coverFileId}`,
    },
    user: {
        list: '/User',
        byId: (id: number) => `/User/${id}`,
        update: '/User/update',
        profile: '/User/profile',
        profileById: (id: number) => `/User/profile/${id}`,
        products: '/User/products',
        delete: (id: number) => `/User/${id}`,
    },
    file: {
        productFiles: (productId: number) => `/File/product/${productId}`,
        productFileById: (fileId: number) => `/File/product/file/${fileId}`,
        uploadProductFile: (productId: number) => `/File/product/${productId}`,
        uploadProductFilesBulk: (productId: number) => `/File/product/${productId}/bulk`,
        deleteProductFile: (fileId: number) => `/File/product/${fileId}`,
        photoFile: (photoId: number) => `/File/photo/${photoId}`,
        deletePhotoFile: (photoId: number) => `/File/photo/${photoId}`,
    },
    payment: {
        stripeCreate: '/Payment/stripe/create',
        stripeUpdateStatus: '/Payment/stripe/update-status',
        stripeComplete: '/Payment/stripe/complete',
    },
    blob: {
        image: (id: number) => `/blob/${id}`,
    },
    favorite: {
        list: '/Favorite',
        check: (productId: number) => `/Favorite/check/${productId}`,
        add: (productId: number) => `/Favorite/${productId}`,
        remove: (productId: number) => `/Favorite/${productId}`,
    },
} as const;


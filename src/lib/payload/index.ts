/**
 * Payload CMS Integration
 *
 * Consolidated exports for Payload CMS client, API utilities, and type adapters.
 * Import from this file for cleaner imports throughout the application.
 */

// Re-export everything from payload-client
export {
  // Product functions
  getProducts,
  getProduct,
  getProductBySku,
  searchProducts,
  getFeaturedProducts,

  // Category functions
  getCategories,
  getCategory,
  getCategoryBySlug,
  getProductsByCategory,

  // Order functions
  getOrders,
  getOrder,
  getOrderByNumber,

  // Media functions
  getMedia,
  getAllMedia,

  // Auth functions
  login,
  logout,
  getCurrentUser,
  register,

  // Utility functions
  getMediaUrl,
  getProductImageUrl,
  getVariantImageUrl,
  calculateConservationDonation,
  hasVariants,
  getVariantBySku,
  isVariantInStock,
  getAvailableSizes,
  getAvailableColors,
  getAvailableMaterials,

  // Types
  type PayloadResponse,
  type SingleDocResponse,
  type PayloadError,
  type QueryOptions,
} from '../payload-client'

// Re-export everything from payload-api
export {
  // Order operations
  createOrder,
  cartToOrderItems,
  updateOrderStatus,
  updateOrderPaymentStatus,
  addOrderTracking,

  // Inventory management
  incrementInventory,
  checkInventoryAvailability,

  // Authentication
  loginUser,
  logoutUser,
  registerUser,
  getAuthenticatedUser,
  updateUserProfile,
  isAuthenticated,
  isAdmin,
  isStaff,

  // Utility functions
  calculateOrderTotals,
  formatPrice,
  isValidEmail,
  isValidZipCode,

  // Types
  type CreateOrderInput,
  type CreateOrderResponse,
  type UpdateInventoryInput,
  type AuthResponse,
} from '../payload-api'

// Re-export everything from type-adapters
export {
  // Conversion functions
  payloadProductToAppProduct,
  payloadCategoryToAppCategory,
  payloadVariantToAppVariant,
  createCartItemFromPayload,

  // Display utilities
  getVariantDisplayInfo,
  getProductPriceRange,
  formatProductPrice,
  formatVariantName,

  // Filtering and sorting
  productMatchesFilters,
  sortProducts,

  // Collection utilities
  getUniqueMaterials,
  getUniqueColors,
  getUniqueSizes,

  // Stock utilities
  getStockStatus,
  getTotalProductStock,
  hasMultipleVariants,
  getDefaultVariant,
} from '../type-adapters'

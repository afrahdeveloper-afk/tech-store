/**
 * UI copy dictionary, keyed by language. This covers chrome and section text
 * (navbar, footer, homepage sections) — not domain data, which carries its
 * own `nameAr`/`descriptionAr` fields (see the note in `types/index.ts`) and
 * lives in `lib/mock/*`.
 *
 * There is no locale-routing infrastructure yet, so both languages ship in
 * one bundle and the active one is a client-side toggle — see
 * `components/providers/language-provider.tsx`.
 */

export type Lang = "en" | "ar";

export interface Dictionary {
  /** Small cross-page strings with no natural single-section home — currently just the generic route-level loading label (see `components/shared/route-loading-skeleton.tsx`). */
  common: {
    loading: string;
  };
  nav: {
    home: string;
    products: string;
    services: string;
    booking: string;
    about: string;
    cart: string;
    account: string;
    login: string;
    bookService: string;
    openMenu: string;
    closeMenu: string;
    switchLanguageTo: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    chips: string[];
    /** `role="status"` label for the 3D laptop's loading skeleton (`hero-visual.tsx`), desktop only. */
    loading3d: string;
  };
  categories: {
    eyebrow: string;
    heading: string;
    description: string;
    viewAll: string;
  };
  products: {
    eyebrow: string;
    heading: string;
    description: string;
    viewAll: string;
    addToCart: string;
    viewDetails: string;
    inStock: string;
    lowStock: string;
    outOfStock: string;
    discountBadge: string;
    pageEyebrow: string;
    pageHeading: string;
    pageDescription: string;
    searchLabel: string;
    searchPlaceholder: string;
    categoryLabel: string;
    allCategories: string;
    subcategoryLabel: string;
    allSubcategories: string;
    sortLabel: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortNameAsc: string;
    clearFilters: string;
    resultsCountOne: string;
    resultsCountOther: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    errorTitle: string;
    errorDescription: string;
    retry: string;
    paginationPrevious: string;
    paginationNext: string;
    paginationPageOf: string;
  };
  productDetails: {
    breadcrumbHome: string;
    breadcrumbProducts: string;
    galleryLabel: string;
    viewLargerLabel: string;
    quantityLabel: string;
    decreaseQuantity: string;
    increaseQuantity: string;
    highlightsHeading: string;
    relatedHeading: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToProducts: string;
  };
  cart: {
    pageEyebrow: string;
    pageHeading: string;
    pageDescription: string;
    emptyTitle: string;
    emptyDescription: string;
    browseProducts: string;
    summaryHeading: string;
    subtotalLabel: string;
    totalLabel: string;
    checkoutCta: string;
    continueShopping: string;
    quantityLabel: string;
    decreaseQuantity: string;
    increaseQuantity: string;
    removeItem: string;
    addedToCart: string;
    issueRemovedTitle: string;
    issueRemovedDescription: string;
    issueOutOfStockTitle: string;
    issueOutOfStockDescription: string;
    issueQuantityAdjustedTitle: string;
    issueQuantityAdjustedDescription: string;
    checkoutBlockedNotice: string;
  };
  checkout: {
    pageEyebrow: string;
    pageHeading: string;
    pageDescription: string;
    emptyCartTitle: string;
    emptyCartDescription: string;
    backToCart: string;
    customerInfoHeading: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    orderSummaryHeading: string;
    subtotalLabel: string;
    totalLabel: string;
    paymentNoteHeading: string;
    paymentNoteDescription: string;
    submitCta: string;
    submitting: string;
    errorRequired: string;
    errorTooLong: string;
    errorEmail: string;
    errorPhone: string;
    submissionErrorTitle: string;
    submissionErrorDescription: string;
    errorMaintenance: string;
    retry: string;
    successTitle: string;
    successDescription: string;
    orderNumberLabel: string;
    continueShopping: string;
    backToHome: string;
  };
  booking: {
    pageEyebrow: string;
    pageHeading: string;
    pageDescription: string;
    noServiceTitle: string;
    noServiceDescription: string;
    notFoundTitle: string;
    notFoundDescription: string;
    unavailableTitle: string;
    unavailableDescription: string;
    browseServices: string;
    serviceSummaryHeading: string;
    categoryLabel: string;
    subserviceLabel: string;
    priceLabel: string;
    durationLabel: string;
    minutesLabel: string;
    formHeading: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    dateLabel: string;
    timeLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    attachmentsLabel: string;
    attachmentsHint: string;
    submitCta: string;
    submitting: string;
    errorRequired: string;
    errorTooLong: string;
    errorEmail: string;
    errorPhone: string;
    errorDate: string;
    errorPastDate: string;
    errorTime: string;
    errorAttachments: string;
    submissionErrorTitle: string;
    submissionErrorDescription: string;
    errorMaintenance: string;
    retry: string;
    successTitle: string;
    successDescription: string;
    bookingNumberLabel: string;
    nextStepsHeading: string;
    nextStepsDescription: string;
    backToServices: string;
    backToHome: string;
  };
  services: {
    eyebrow: string;
    heading: string;
    description: string;
    viewAll: string;
    learnMore: string;
    pageEyebrow: string;
    pageHeading: string;
    pageDescription: string;
    viewServicesCta: string;
    priceLabel: string;
    durationLabel: string;
    minutesLabel: string;
    availableLabel: string;
    unavailableLabel: string;
    bookServiceCta: string;
    viewDetailsCta: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  serviceDetails: {
    breadcrumbHome: string;
    breadcrumbServices: string;
    relatedHeading: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToServices: string;
  };
  whyChooseUs: {
    eyebrow: string;
    heading: string;
    description: string;
    items: { title: string; description: string }[];
  };
  about: {
    eyebrow: string;
    heading: string;
    description: string;
    cta: string;
  };
  aboutPage: {
    heroEyebrow: string;
    heroHeading: string;
    heroDescription: string;
    overviewEyebrow: string;
    overviewHeading: string;
    overviewParagraph1: string;
    overviewParagraph2: string;
    whatWeDoEyebrow: string;
    whatWeDoHeading: string;
    whatWeDoDescription: string;
    whatWeDoItems: { title: string; description: string }[];
    valuesEyebrow: string;
    valuesHeading: string;
    valuesItems: { title: string; description: string }[];
    capabilitiesEyebrow: string;
    capabilitiesHeading: string;
    capabilitiesDescription: string;
    capabilitiesCta: string;
  };
  finalCta: {
    heading: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  footer: {
    tagline: string;
    shopHeading: string;
    servicesHeading: string;
    companyHeading: string;
    contactHeading: string;
    hours: string;
    rights: string;
  };
  auth: {
    loginEyebrow: string;
    loginHeading: string;
    loginDescription: string;
    registerEyebrow: string;
    registerHeading: string;
    registerDescription: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginCta: string;
    loggingIn: string;
    registerCta: string;
    registering: string;
    noAccountPrompt: string;
    registerLink: string;
    hasAccountPrompt: string;
    loginLink: string;
    errorRequired: string;
    errorTooLong: string;
    errorEmail: string;
    errorPhone: string;
    errorWeakPassword: string;
    errorEmailTaken: string;
    errorInvalidCredentials: string;
    /** Security audit F-02 — customer login rate limiting (`lib/auth/customer-login-rate-limit.ts`). Deliberately as generic as the other auth errors here: no attempt count or wait time disclosed. */
    errorRateLimited: string;
    errorServer: string;
  };
  account: {
    pageEyebrow: string;
    pageHeading: string;
    pageDescription: string;
    accountInfoHeading: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    logoutCta: string;
  };
  dashboardNav: {
    ariaLabel: string;
    overview: string;
    ordersBookings: string;
    profile: string;
    logout: string;
  };
  dashboard: {
    pageEyebrow: string;
    pageHeading: string;
    pageDescription: string;
    statTotalOrders: string;
    statTotalBookings: string;
    statActive: string;
    statNextAppointment: string;
    noUpcomingAppointment: string;
    recentActivityHeading: string;
    viewAllCta: string;
  };
  accountActivity: {
    pageEyebrow: string;
    pageHeading: string;
    pageDescription: string;
    searchLabel: string;
    searchPlaceholder: string;
    tabAll: string;
    tabProducts: string;
    tabServices: string;
    orderNumberLabel: string;
    bookingNumberLabel: string;
    dateLabel: string;
    itemsCountOne: string;
    itemsCountOther: string;
    scheduledLabel: string;
    statusPending: string;
    statusConfirmed: string;
    statusShipped: string;
    statusDelivered: string;
    statusCompleted: string;
    statusCancelled: string;
    emptyOrdersTitle: string;
    emptyOrdersDescription: string;
    emptyBookingsTitle: string;
    emptyBookingsDescription: string;
    browseServices: string;
    emptyAllTitle: string;
    emptyAllDescription: string;
    emptySearchTitle: string;
    emptySearchDescription: string;
  };
  statusTimeline: {
    orderHeading: string;
    bookingHeading: string;
    cancelledNotice: string;
    lastUpdatedLabel: string;
    stepStatusDone: string;
    stepStatusCurrent: string;
    stepStatusUpcoming: string;
  };
  accountOrderDetails: {
    breadcrumbAccount: string;
    breadcrumbOrders: string;
    heading: string;
    productLabel: string;
    unitPriceLabel: string;
    customerInfoHeading: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToOrders: string;
  };
  accountBookingDetails: {
    breadcrumbAccount: string;
    breadcrumbBookings: string;
    heading: string;
    serviceLabel: string;
    scheduledDateLabel: string;
    scheduledTimeLabel: string;
    notesLabel: string;
    photosHeading: string;
    customerInfoHeading: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToBookings: string;
  };
  notFoundPage: {
    title: string;
    description: string;
    backToHome: string;
    browseProducts: string;
  };
  /** `/maintenance` — rendered (via `proxy.ts`'s rewrite) in place of any
   * customer-facing page while `StoreSettings.maintenanceMode` is on. Never
   * reached directly by a real navigation — see `app/maintenance/page.tsx`. */
  maintenancePage: {
    title: string;
    heading: string;
    description: string;
    checkBackNote: string;
  };
  // Admin Dashboard (Phase 12) — a separate, English/Arabic-ready namespace
  // for `/admin/*` only. Kept isolated from the storefront blocks above
  // (rather than reusing e.g. `nav`/`dashboard`) since the two UIs render
  // completely different chrome and must stay free to diverge in copy.
  adminNav: {
    ariaLabel: string;
    dashboard: string;
    products: string;
    serviceCategories: string;
    subservices: string;
    services: string;
    orders: string;
    bookings: string;
    customers: string;
    settings: string;
    collapseSidebar: string;
    expandSidebar: string;
    logout: string;
  };
  adminHeader: {
    breadcrumbHome: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchingLabel: string;
    searchNoResults: string;
    searchProductsGroup: string;
    searchCustomersGroup: string;
    searchOrdersGroup: string;
    notificationsLabel: string;
    noNotifications: string;
    pendingOrdersNotificationOne: string;
    pendingOrdersNotificationOther: string;
    pendingBookingsNotificationOne: string;
    pendingBookingsNotificationOther: string;
    profileMenuLabel: string;
    switchLanguageTo: string;
    openMenu: string;
    closeMenu: string;
    openSearch: string;
    closeSearch: string;
  };
  adminDashboard: {
    eyebrow: string;
    heading: string;
    description: string;
    statRevenue: string;
    statOrders: string;
    statBookings: string;
    statCustomers: string;
    statProducts: string;
    statPendingOrders: string;
    statPendingBookings: string;
    chartHeading: string;
    chartDescription: string;
    chartOrdersLegend: string;
    chartBookingsLegend: string;
    chartRevenueLegend: string;
    chartEmptyTitle: string;
    chartEmptyDescription: string;
    recentOrdersHeading: string;
    recentBookingsHeading: string;
    viewAll: string;
    emptyOrdersTitle: string;
    emptyOrdersDescription: string;
    emptyBookingsTitle: string;
    emptyBookingsDescription: string;
    quickActionsHeading: string;
    quickActionProducts: string;
    quickActionOrders: string;
    quickActionBookings: string;
    quickActionCustomers: string;
  };
  adminCommon: {
    columnStatus: string;
    columnDate: string;
    columnActions: string;
    crudComingSoonTitle: string;
    crudComingSoonDescription: string;
    totalCountOne: string;
    totalCountOther: string;
    searchLabel: string;
    allLabel: string;
    sortLabel: string;
    sortNewest: string;
    sortOldest: string;
    sortNameAsc: string;
    resultsCountOne: string;
    resultsCountOther: string;
    errorTitle: string;
    errorDescription: string;
    retryLabel: string;
  };
  adminProducts: {
    heading: string;
    description: string;
    columnProduct: string;
    columnCategory: string;
    columnPrice: string;
    columnStock: string;
    emptyTitle: string;
    emptyDescription: string;
    statusDraft: string;
    statusActive: string;
    statusArchived: string;
    formAddTitle: string;
    formEditTitle: string;
    rowEdit: string;
    rowDelete: string;
    searchPlaceholder: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    statusFilterLabel: string;
  };
  adminServiceCategories: {
    heading: string;
    description: string;
    columnName: string;
    columnDescription: string;
    subserviceCount: string;
    emptyTitle: string;
    emptyDescription: string;
    formAddTitle: string;
    formEditTitle: string;
    rowEdit: string;
    rowDelete: string;
    searchPlaceholder: string;
  };
  adminSubservices: {
    heading: string;
    description: string;
    columnName: string;
    columnCategory: string;
    serviceCount: string;
    emptyTitle: string;
    emptyDescription: string;
    formAddTitle: string;
    formEditTitle: string;
    rowEdit: string;
    rowDelete: string;
    searchPlaceholder: string;
  };
  adminServices: {
    heading: string;
    description: string;
    columnService: string;
    columnSubservice: string;
    columnPrice: string;
    columnDuration: string;
    minutesSuffix: string;
    emptyTitle: string;
    emptyDescription: string;
    statusActive: string;
    statusInactive: string;
    noPriceSet: string;
    formAddTitle: string;
    formEditTitle: string;
    rowEdit: string;
    rowDelete: string;
    searchPlaceholder: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    statusFilterLabel: string;
  };
  adminOrders: {
    heading: string;
    description: string;
    columnNumber: string;
    columnCustomer: string;
    columnTotal: string;
    emptyTitle: string;
    emptyDescription: string;
    detailTitle: string;
    itemsHeading: string;
    columnProduct: string;
    columnQuantity: string;
    columnUnitPrice: string;
    columnLineTotal: string;
    subtotalLabel: string;
    discountLabel: string;
    totalLabel: string;
    notesLabel: string;
    customerInfoHeading: string;
    placedOnLabel: string;
    searchPlaceholder: string;
    sortAmountAsc: string;
    sortAmountDesc: string;
    statusFilterLabel: string;
    dateFromLabel: string;
    dateToLabel: string;
    currentStatusLabel: string;
    updateStatusHeading: string;
    actionConfirmOrder: string;
    actionShipOrder: string;
    actionConfirmDelivery: string;
    actionCancelOrder: string;
    deliveredNotice: string;
    cancelledNotice: string;
    updateStatusDialogDescription: string;
    updateStatusConfirmAction: string;
    cancelOrderDialogTitle: string;
    cancelOrderDialogDescription: string;
    dialogBackLabel: string;
    timelineHeading: string;
    timelineOrderCreated: string;
  };
  adminBookings: {
    heading: string;
    description: string;
    columnNumber: string;
    columnCustomer: string;
    columnService: string;
    emptyTitle: string;
    emptyDescription: string;
    detailTitle: string;
    categoryLabel: string;
    subserviceLabel: string;
    serviceLabel: string;
    priceLabel: string;
    durationLabel: string;
    scheduledDateLabel: string;
    scheduledTimeLabel: string;
    notesLabel: string;
    photosHeading: string;
    customerInfoHeading: string;
    placedOnLabel: string;
    minutesSuffix: string;
    noPriceSet: string;
    noScheduleSet: string;
    searchPlaceholder: string;
    statusFilterLabel: string;
    dateFromLabel: string;
    dateToLabel: string;
    currentStatusLabel: string;
    updateStatusHeading: string;
    actionConfirmBooking: string;
    actionCompleteService: string;
    actionCancelBooking: string;
    completedNotice: string;
    cancelledNotice: string;
    confirmBookingDialogTitle: string;
    updateStatusDialogDescription: string;
    updateStatusConfirmAction: string;
    completeServiceDialogTitle: string;
    completeServiceDialogDescription: string;
    completeServiceConfirmAction: string;
    cancelBookingDialogTitle: string;
    cancelBookingDialogDescription: string;
    dialogBackLabel: string;
    timelineHeading: string;
    timelineBookingCreated: string;
    timelineBookingCancelled: string;
  };
  adminCustomers: {
    heading: string;
    description: string;
    columnName: string;
    columnContact: string;
    columnOrders: string;
    columnBookings: string;
    columnJoined: string;
    emptyTitle: string;
    emptyDescription: string;
    detailTitle: string;
    contactHeading: string;
    activityHeading: string;
    noActivity: string;
    rowView: string;
    searchPlaceholder: string;
  };
  adminSettings: {
    heading: string;
    description: string;
    profileHeading: string;
    profileDescription: string;
    nameLabel: string;
    emailLabel: string;
    storeHeading: string;
    storeDescription: string;
    storeNameLabel: string;
    storeNameArLabel: string;
    contactEmailLabel: string;
    contactPhoneLabel: string;
    contactAddressLabel: string;
    contactAddressArLabel: string;
    currencyLabel: string;
    maintenanceModeLabel: string;
    maintenanceModeHint: string;
    saveSuccessTitle: string;
    lastUpdatedLabel: string;
    changePasswordHeading: string;
    changePasswordDescription: string;
    currentPasswordLabel: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    changePasswordButton: string;
    changePasswordSuccessTitle: string;
    errorPasswordMismatch: string;
    errorIncorrectCurrentPassword: string;
  };
  adminForm: {
    addNew: string;
    edit: string;
    delete: string;
    save: string;
    saving: string;
    cancel: string;
    backToList: string;
    nameLabel: string;
    nameArLabel: string;
    descriptionLabel: string;
    descriptionArLabel: string;
    priceLabel: string;
    discountPriceLabel: string;
    discountPriceHint: string;
    stockQuantityLabel: string;
    durationMinutesLabel: string;
    statusLabel: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    subcategoryLabel: string;
    subcategoryPlaceholder: string;
    subcategoryNone: string;
    imagesHeading: string;
    imagesHint: string;
    /** Add Product's image picker (Global Image System) — clarifies photos aren't uploaded yet, unlike Edit mode's Image Manager. */
    newProductImagesHint: string;
    productIconLabel: string;
    productIconHint: string;
    productIconOptions: {
      laptop: string;
      desktop: string;
      monitor: string;
      smartphone: string;
      headphones: string;
      accessories: string;
      camera: string;
      keyboard: string;
      mouse: string;
      printer: string;
      network: string;
      server: string;
      harddrive: string;
      ups: string;
      bagscases: string;
      security: string;
    };
    requiredIndicator: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    deleteConfirmAction: string;
    deleting: string;
    createSuccessTitle: string;
    /** Add Product (Global Image System) — the product itself was created, but its selected photos failed to upload; shown instead of `createSuccessTitle`. */
    createSuccessImagesFailedTitle: string;
    createSuccessImagesFailedDescription: string;
    updateSuccessTitle: string;
    deleteSuccessTitle: string;
    mutationErrorTitle: string;
    errorMissingFields: string;
    /** A-03 — Admin CRUD/settings max-length guard (lib/validation.ts's MAX_ADMIN_* constants). */
    errorInvalidLength: string;
    errorInvalidPrice: string;
    errorInvalidDiscount: string;
    errorInvalidStock: string;
    errorInvalidCategory: string;
    errorInvalidSubcategory: string;
    errorNotFound: string;
    errorUnauthorized: string;
    errorServer: string;
    errorHasDependents: string;
    errorInvalidEmail: string;
    errorInvalidPhone: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToDashboard: string;
    updateStatusLabel: string;
    updateStatusButton: string;
    noTransitionsAvailable: string;
    statusUpdateSuccessTitle: string;
    cancelStatusConfirmTitle: string;
    cancelStatusConfirmDescription: string;
  };
  /**
   * Shared strings for the Global Image System — reused across the Admin
   * Product Image Manager, the storefront Product Gallery + its preview
   * dialog, Booking Image Upload, and the Customer/Admin Booking Galleries
   * (the preview dialog itself is one shared component, so its close/
   * previous/next labels live here once instead of per-context).
   */
  imageGallery: {
    closeLabel: string;
    previousImageLabel: string;
    nextImageLabel: string;
    primaryBadge: string;
    addPhotosLabel: string;
    uploadingLabel: string;
    removePhotoLabel: string;
    setPrimaryLabel: string;
    moveEarlierLabel: string;
    moveLaterLabel: string;
    deletePhotoLabel: string;
    deleteConfirmTitle: string;
    deleteConfirmDescription: string;
    dragToReorderHint: string;
    noPhotosYet: string;
    errorInvalidFile: string;
    errorFileTooLarge: string;
    errorTooManyImages: string;
    errorUploadFailed: string;
  };
}

export const dictionaries: Record<Lang, Dictionary> = {
  en: {
    common: {
      loading: "Loading…",
    },
    nav: {
      home: "Home",
      products: "Products",
      services: "Services",
      booking: "Booking",
      about: "About",
      cart: "Cart",
      account: "Account",
      login: "Log In",
      bookService: "Book a Service",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      switchLanguageTo: "العربية",
    },
    hero: {
      eyebrow: "Premium Tech Store & IT Care",
      headline: "Premium devices. Expert repairs.",
      headlineAccent: "One trusted place.",
      description:
        "Shop curated laptops, desktops, and accessories — or book certified technicians for fast, reliable IT maintenance. Everything your setup needs, calibrated to perform.",
      ctaPrimary: "Shop Products",
      ctaSecondary: "Book a Service",
      chips: ["Certified technicians", "Genuine parts & devices", "Fast turnaround"],
      loading3d: "Loading 3D preview…",
    },
    categories: {
      eyebrow: "Browse by Category",
      heading: "Find exactly what you need",
      description:
        "From everyday laptops to networking gear — explore our core technology categories.",
      viewAll: "View all products",
    },
    products: {
      eyebrow: "Featured Products",
      heading: "Handpicked technology, ready to ship",
      description: "A curated selection of the devices and components our team recommends most.",
      viewAll: "View all products",
      addToCart: "Add to Cart",
      viewDetails: "View Details",
      inStock: "In Stock",
      lowStock: "Low Stock",
      outOfStock: "Out of Stock",
      discountBadge: "Sale",
      pageEyebrow: "Shop All Products",
      pageHeading: "Technology, sourced and ready",
      pageDescription:
        "Search and filter our full catalog of laptops, desktops, monitors, storage, networking gear, and accessories.",
      searchLabel: "Search products",
      searchPlaceholder: "Search by name or keyword…",
      categoryLabel: "Category",
      allCategories: "All Categories",
      subcategoryLabel: "Subcategory",
      allSubcategories: "All Subcategories",
      sortLabel: "Sort by",
      sortFeatured: "Featured",
      sortPriceAsc: "Price: Low to High",
      sortPriceDesc: "Price: High to Low",
      sortNameAsc: "Name: A to Z",
      clearFilters: "Clear filters",
      resultsCountOne: "{count} product",
      resultsCountOther: "{count} products",
      loading: "Loading products…",
      emptyTitle: "No products found",
      emptyDescription: "Try a different search term or clear your filters to see more products.",
      errorTitle: "Couldn't load products",
      errorDescription: "Something went wrong while loading the catalog. Please try again.",
      retry: "Retry",
      paginationPrevious: "Previous",
      paginationNext: "Next",
      paginationPageOf: "Page {page} of {total}",
    },
    productDetails: {
      breadcrumbHome: "Home",
      breadcrumbProducts: "Products",
      galleryLabel: "Product images",
      viewLargerLabel: "View larger image",
      quantityLabel: "Quantity",
      decreaseQuantity: "Decrease quantity",
      increaseQuantity: "Increase quantity",
      highlightsHeading: "Key Features",
      relatedHeading: "You may also like",
      notFoundTitle: "Product not found",
      notFoundDescription: "This product may have been removed or the link is incorrect.",
      backToProducts: "Back to Products",
    },
    cart: {
      pageEyebrow: "Your Cart",
      pageHeading: "Review your items",
      pageDescription: "Check quantities and pricing before you check out.",
      emptyTitle: "Your cart is empty",
      emptyDescription: "Browse our catalog and add products to see them here.",
      browseProducts: "Browse Products",
      summaryHeading: "Order Summary",
      subtotalLabel: "Subtotal",
      totalLabel: "Total",
      checkoutCta: "Proceed to Checkout",
      continueShopping: "Continue Shopping",
      quantityLabel: "Quantity",
      decreaseQuantity: "Decrease quantity",
      increaseQuantity: "Increase quantity",
      removeItem: "Remove item",
      addedToCart: "Added",
      issueRemovedTitle: "No longer available",
      issueRemovedDescription: "This product has been removed from our catalog.",
      issueOutOfStockTitle: "Now out of stock",
      issueOutOfStockDescription: "This item sold out since you added it — remove it to continue.",
      issueQuantityAdjustedTitle: "Quantity adjusted",
      issueQuantityAdjustedDescription: "Only {max} left in stock — reduce the quantity to continue.",
      checkoutBlockedNotice: "Resolve the items flagged below before checking out.",
    },
    checkout: {
      pageEyebrow: "Checkout",
      pageHeading: "Complete your order",
      pageDescription: "Enter your details and we'll confirm your order shortly.",
      emptyCartTitle: "Your cart is empty",
      emptyCartDescription: "Add products to your cart before checking out.",
      backToCart: "Back to Cart",
      customerInfoHeading: "Customer Information",
      fullNameLabel: "Full name",
      fullNamePlaceholder: "Your full name",
      emailLabel: "Email address",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone number",
      phonePlaceholder: "+964 7XX XXX XXXX",
      orderSummaryHeading: "Order Summary",
      subtotalLabel: "Subtotal",
      totalLabel: "Total",
      paymentNoteHeading: "Payment",
      paymentNoteDescription:
        "Online payment isn't set up yet — submitting places your order as a request. Our team will contact you to confirm payment and delivery.",
      submitCta: "Place Order",
      submitting: "Placing your order…",
      errorRequired: "This field is required.",
      errorTooLong: "This value is too long.",
      errorEmail: "Enter a valid email address.",
      errorPhone: "Enter a valid phone number.",
      submissionErrorTitle: "Couldn't place your order",
      submissionErrorDescription: "Something went wrong while submitting your order. Please try again.",
      errorMaintenance: "The store is temporarily down for maintenance. Please try again shortly.",
      retry: "Retry",
      successTitle: "Order received",
      successDescription: "Thanks — we've received your order request. Our team will reach out shortly to confirm payment and delivery.",
      orderNumberLabel: "Order number",
      continueShopping: "Continue Shopping",
      backToHome: "Back to Home",
    },
    booking: {
      pageEyebrow: "Book a Service",
      pageHeading: "Schedule your service",
      pageDescription: "Tell us when works for you and we'll confirm your appointment.",
      noServiceTitle: "No service selected",
      noServiceDescription: "Choose a service from our catalog to start booking an appointment.",
      notFoundTitle: "Service not found",
      notFoundDescription: "This service may have been removed or the link is incorrect.",
      unavailableTitle: "Service currently unavailable",
      unavailableDescription: "This service isn't bookable right now — please choose another one.",
      browseServices: "Browse Services",
      serviceSummaryHeading: "Service Summary",
      categoryLabel: "Category",
      subserviceLabel: "Type",
      priceLabel: "Price",
      durationLabel: "Duration",
      minutesLabel: "min",
      formHeading: "Your Information",
      fullNameLabel: "Full name",
      fullNamePlaceholder: "Your full name",
      emailLabel: "Email address",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone number",
      phonePlaceholder: "+964 7XX XXX XXXX",
      dateLabel: "Preferred date",
      timeLabel: "Preferred time",
      notesLabel: "Notes (optional)",
      notesPlaceholder: "Anything our technician should know beforehand…",
      attachmentsLabel: "Photos (optional)",
      attachmentsHint: "Add photos of the device or issue so our technician can prepare — up to 5, 5MB each.",
      submitCta: "Confirm Booking",
      submitting: "Submitting your booking…",
      errorRequired: "This field is required.",
      errorTooLong: "This value is too long.",
      errorEmail: "Enter a valid email address.",
      errorPhone: "Enter a valid phone number.",
      errorDate: "Choose a preferred date.",
      errorPastDate: "Choose a date that's today or later.",
      errorTime: "Choose a preferred time.",
      errorAttachments: "Something went wrong with your photos — try removing and re-adding them.",
      submissionErrorTitle: "Couldn't submit your booking",
      submissionErrorDescription: "Something went wrong while submitting your booking. Please try again.",
      errorMaintenance: "The store is temporarily down for maintenance. Please try again shortly.",
      retry: "Retry",
      successTitle: "Booking confirmed",
      successDescription: "Thanks — your booking request was received. Our team will contact you to confirm the appointment.",
      bookingNumberLabel: "Booking number",
      nextStepsHeading: "What happens next",
      nextStepsDescription: "A member of our team will call or email you to confirm your appointment time and any final details.",
      backToServices: "Back to Services",
      backToHome: "Back to Home",
    },
    services: {
      eyebrow: "IT Repair & Maintenance",
      heading: "Certified service, done right the first time",
      description:
        "From a cracked laptop screen to a full network setup — our technicians handle it with transparent pricing and real timelines.",
      viewAll: "View all services",
      learnMore: "Learn more",
      pageEyebrow: "IT Repair & Maintenance",
      pageHeading: "Certified service, by category",
      pageDescription:
        "Choose a service category to see its service types, then pick the exact, bookable service you need — with upfront IQD pricing and duration.",
      viewServicesCta: "View Services",
      priceLabel: "Price",
      durationLabel: "Duration",
      minutesLabel: "min",
      availableLabel: "Available",
      unavailableLabel: "Currently Unavailable",
      bookServiceCta: "Book This Service",
      viewDetailsCta: "View Details",
      loading: "Loading services…",
      emptyTitle: "No services listed yet",
      emptyDescription: "This category doesn't have any bookable services yet — check back soon.",
    },
    serviceDetails: {
      breadcrumbHome: "Home",
      breadcrumbServices: "Services",
      relatedHeading: "Related services",
      notFoundTitle: "Service not found",
      notFoundDescription: "This service may have been removed or the link is incorrect.",
      backToServices: "Back to Services",
    },
    whyChooseUs: {
      eyebrow: "Why Choose Speed Core",
      heading: "Built for people who rely on their tech",
      description:
        "Every product and repair is backed by the same standard: certified people, genuine parts, and clear communication.",
      items: [
        {
          title: "Certified Technicians",
          description: "Every repair is handled by trained, background-checked technicians.",
        },
        {
          title: "Genuine Parts",
          description: "We only use manufacturer-approved parts and tested hardware.",
        },
        {
          title: "Transparent Pricing",
          description: "Clear quotes before we start — no surprise fees.",
        },
        {
          title: "Fast Turnaround",
          description: "Most repairs are completed within 24–48 hours.",
        },
      ],
    },
    about: {
      eyebrow: "About Speed Core",
      heading: "A tech store and repair bench, under one roof",
      description:
        "We started Speed Core to close the gap between buying technology and actually keeping it running. Today we sell curated devices and repair thousands of them — with the same team, the same standards.",
      cta: "Learn more about us",
    },
    aboutPage: {
      heroEyebrow: "About Speed Core",
      heroHeading: "Technology that works. Service you can trust.",
      heroDescription:
        "Speed Core brings technology retail and professional IT maintenance together — one team, one standard, from the products we sell to the repairs we carry out.",
      overviewEyebrow: "About Speed Core",
      overviewHeading: "A tech store and repair bench, under one roof",
      overviewParagraph1:
        "We started Speed Core to close the gap between buying technology and actually keeping it running. Most stores sell you a device and stop there; most repair shops never sell you anything at all. We do both, with the same team and the same standards.",
      overviewParagraph2:
        "Every laptop, desktop, and accessory we sell is backed by the same technicians who repair them — so when something needs attention, you're talking to people who already understand your setup.",
      whatWeDoEyebrow: "What We Do",
      whatWeDoHeading: "Two businesses, one standard",
      whatWeDoDescription:
        "From the products on our shelves to the repairs on our bench, everything runs through the same team.",
      whatWeDoItems: [
        {
          title: "Technology Products",
          description: "Curated laptops, desktops, components, and accessories — sourced and ready to ship.",
        },
        {
          title: "Device Maintenance",
          description: "Diagnostics and repair for laptops, desktops, and printers, using genuine parts.",
        },
        {
          title: "Technical Services",
          description: "Software, OS, and performance support alongside every hardware repair.",
        },
        {
          title: "Network & Infrastructure",
          description: "Router setup, Wi-Fi optimization, and structured cabling for home and office.",
        },
        {
          title: "Data & Software",
          description: "OS installation, driver updates, and safe recovery of lost or corrupted files.",
        },
        {
          title: "Security Systems",
          description: "Installation and maintenance of CCTV, smart cameras, and access systems.",
        },
      ],
      valuesEyebrow: "Our Values",
      valuesHeading: "What guides every job we take on",
      valuesItems: [
        { title: "Reliability", description: "Work that's done right, so it doesn't come back." },
        { title: "Precision", description: "Careful diagnostics before any repair — not guesswork." },
        { title: "Transparency", description: "Clear pricing and honest timelines, before we start." },
        { title: "Continuous Improvement", description: "We keep training and testing, so our standards keep rising." },
      ],
      capabilitiesEyebrow: "Capabilities",
      capabilitiesHeading: "Backed by certified service, category by category",
      capabilitiesDescription:
        "Every product we sell is supported by the same certified technicians behind our service catalog.",
      capabilitiesCta: "View All Services",
    },
    finalCta: {
      heading: "Ready to upgrade or get it fixed?",
      description: "Browse our latest products or book a certified technician in minutes.",
      ctaPrimary: "Shop Products",
      ctaSecondary: "Book a Service",
    },
    footer: {
      tagline: "Premium technology and certified IT maintenance — under one roof.",
      shopHeading: "Shop",
      servicesHeading: "Services",
      companyHeading: "Company",
      contactHeading: "Contact",
      hours: "Sat–Thu, 9:00 AM – 7:00 PM",
      rights: "All rights reserved.",
    },
    auth: {
      loginEyebrow: "Welcome Back",
      loginHeading: "Log in to your account",
      loginDescription: "See your orders and service bookings in one place.",
      registerEyebrow: "Create Account",
      registerHeading: "Create your Speed Core account",
      registerDescription: "Track your orders and service bookings — using the same email you check out or book with.",
      nameLabel: "Full name",
      namePlaceholder: "Your full name",
      emailLabel: "Email address",
      emailPlaceholder: "you@example.com",
      phoneLabel: "Phone number",
      phonePlaceholder: "+964 7XX XXX XXXX",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 8 characters",
      loginCta: "Log In",
      loggingIn: "Logging in…",
      registerCta: "Create Account",
      registering: "Creating your account…",
      noAccountPrompt: "Don't have an account?",
      registerLink: "Create one",
      hasAccountPrompt: "Already have an account?",
      loginLink: "Log in",
      errorRequired: "This field is required.",
      errorTooLong: "This value is too long.",
      errorEmail: "Enter a valid email address.",
      errorPhone: "Enter a valid phone number.",
      errorWeakPassword: "Password must be at least 8 characters.",
      errorEmailTaken: "An account already exists for this email — log in instead.",
      errorInvalidCredentials: "Incorrect email or password.",
      errorRateLimited: "Too many attempts. Please wait a few minutes and try again.",
      errorServer: "Something went wrong. Please try again.",
    },
    account: {
      pageEyebrow: "My Account",
      pageHeading: "Profile",
      pageDescription: "Your account information.",
      accountInfoHeading: "Account Information",
      nameLabel: "Name",
      emailLabel: "Email",
      phoneLabel: "Phone",
      logoutCta: "Log Out",
    },
    dashboardNav: {
      ariaLabel: "Dashboard",
      overview: "Overview",
      ordersBookings: "Orders & Bookings",
      profile: "Profile",
      logout: "Log Out",
    },
    dashboard: {
      pageEyebrow: "My Account",
      pageHeading: "Dashboard",
      pageDescription: "A quick overview of your orders, bookings, and account activity.",
      statTotalOrders: "Total Orders",
      statTotalBookings: "Total Bookings",
      statActive: "Active / In Progress",
      statNextAppointment: "Next Appointment",
      noUpcomingAppointment: "No upcoming appointment",
      recentActivityHeading: "Recent Activity",
      viewAllCta: "View All",
    },
    accountActivity: {
      pageEyebrow: "My Account",
      pageHeading: "Orders & Bookings",
      pageDescription: "Your complete product order and service booking history.",
      searchLabel: "Search orders or bookings",
      searchPlaceholder: "Search orders or bookings…",
      tabAll: "All",
      tabProducts: "Products",
      tabServices: "Services",
      orderNumberLabel: "Order",
      bookingNumberLabel: "Booking",
      dateLabel: "Date",
      itemsCountOne: "{count} item",
      itemsCountOther: "{count} items",
      scheduledLabel: "Scheduled",
      statusPending: "Pending",
      statusConfirmed: "Confirmed",
      statusShipped: "Shipped",
      statusDelivered: "Delivered",
      statusCompleted: "Completed",
      statusCancelled: "Cancelled",
      emptyOrdersTitle: "No product orders yet.",
      emptyOrdersDescription: "Your product orders will appear here once you place one.",
      emptyBookingsTitle: "No service bookings yet.",
      emptyBookingsDescription: "Your service bookings will appear here once you book one.",
      browseServices: "Browse Services",
      emptyAllTitle: "No activity yet",
      emptyAllDescription: "Your activity will appear here after you place an order or book a service.",
      emptySearchTitle: "No matching results",
      emptySearchDescription: "Try a different search term or switch tabs.",
    },
    statusTimeline: {
      orderHeading: "Order Status",
      bookingHeading: "Booking Status",
      cancelledNotice: "This was cancelled and will not proceed further.",
      lastUpdatedLabel: "Last updated",
      stepStatusDone: "completed",
      stepStatusCurrent: "current step",
      stepStatusUpcoming: "upcoming",
    },
    accountOrderDetails: {
      breadcrumbAccount: "Dashboard",
      breadcrumbOrders: "Orders & Bookings",
      heading: "Order",
      productLabel: "Product",
      unitPriceLabel: "Unit Price",
      customerInfoHeading: "Customer Information",
      notFoundTitle: "Order not found",
      notFoundDescription: "This order doesn't exist or doesn't belong to this account.",
      backToOrders: "Back to Orders & Bookings",
    },
    accountBookingDetails: {
      breadcrumbAccount: "Dashboard",
      breadcrumbBookings: "Orders & Bookings",
      heading: "Booking",
      serviceLabel: "Service",
      scheduledDateLabel: "Scheduled Date",
      scheduledTimeLabel: "Scheduled Time",
      notesLabel: "Notes",
      photosHeading: "Photos",
      customerInfoHeading: "Customer Information",
      notFoundTitle: "Booking not found",
      notFoundDescription: "This booking doesn't exist or doesn't belong to this account.",
      backToBookings: "Back to Orders & Bookings",
    },
    notFoundPage: {
      title: "Page not found",
      description: "The page you're looking for doesn't exist or may have moved.",
      backToHome: "Back to Home",
      browseProducts: "Browse Products",
    },
    maintenancePage: {
      title: "Under Maintenance",
      heading: "We'll be right back",
      description: "Speed Core is temporarily down for scheduled maintenance. We're working to restore service as quickly as possible.",
      checkBackNote: "Please check back shortly.",
    },
    adminNav: {
      ariaLabel: "Admin navigation",
      dashboard: "Dashboard",
      products: "Products",
      serviceCategories: "Service Categories",
      subservices: "Subservices",
      services: "Services",
      orders: "Orders",
      bookings: "Bookings",
      customers: "Customers",
      settings: "Settings",
      collapseSidebar: "Collapse sidebar",
      expandSidebar: "Expand sidebar",
      logout: "Log Out",
    },
    adminHeader: {
      breadcrumbHome: "Admin",
      searchLabel: "Search",
      searchPlaceholder: "Search products, customers, orders…",
      searchingLabel: "Searching…",
      searchNoResults: "No results found",
      searchProductsGroup: "Products",
      searchCustomersGroup: "Customers",
      searchOrdersGroup: "Orders",
      notificationsLabel: "Notifications",
      noNotifications: "You're all caught up — no pending items.",
      pendingOrdersNotificationOne: "{count} order awaiting confirmation",
      pendingOrdersNotificationOther: "{count} orders awaiting confirmation",
      pendingBookingsNotificationOne: "{count} booking awaiting confirmation",
      pendingBookingsNotificationOther: "{count} bookings awaiting confirmation",
      profileMenuLabel: "Admin account menu",
      switchLanguageTo: "العربية",
      openMenu: "Open navigation menu",
      closeMenu: "Close navigation menu",
      openSearch: "Open search",
      closeSearch: "Close search",
    },
    adminDashboard: {
      eyebrow: "Overview",
      heading: "Dashboard",
      description: "A real-time snapshot of store activity, pulled live from the database.",
      statRevenue: "Total Revenue",
      statOrders: "Total Orders",
      statBookings: "Total Bookings",
      statCustomers: "Total Customers",
      statProducts: "Active Products",
      statPendingOrders: "Pending Orders",
      statPendingBookings: "Pending Bookings",
      chartHeading: "Orders, Bookings & Revenue",
      chartDescription: "Last 14 days",
      chartOrdersLegend: "Orders",
      chartBookingsLegend: "Bookings",
      chartRevenueLegend: "Revenue",
      chartEmptyTitle: "No activity yet",
      chartEmptyDescription: "Orders and bookings placed in the last 14 days will appear here.",
      recentOrdersHeading: "Recent Orders",
      recentBookingsHeading: "Recent Bookings",
      viewAll: "View all",
      emptyOrdersTitle: "No orders yet",
      emptyOrdersDescription: "New orders placed at checkout will show up here.",
      emptyBookingsTitle: "No bookings yet",
      emptyBookingsDescription: "New service bookings will show up here.",
      quickActionsHeading: "Quick Actions",
      quickActionProducts: "Manage Products",
      quickActionOrders: "View Orders",
      quickActionBookings: "View Bookings",
      quickActionCustomers: "View Customers",
    },
    adminCommon: {
      columnStatus: "Status",
      columnDate: "Date",
      columnActions: "Actions",
      crudComingSoonTitle: "Editing coming soon",
      crudComingSoonDescription:
        "This section currently shows live, real data from the database. Add/Edit/Delete forms are being built next.",
      totalCountOne: "{count} item",
      totalCountOther: "{count} items",
      searchLabel: "Search",
      allLabel: "All",
      sortLabel: "Sort by",
      sortNewest: "Newest first",
      sortOldest: "Oldest first",
      sortNameAsc: "Name (A–Z)",
      resultsCountOne: "{count} result",
      resultsCountOther: "{count} results",
      errorTitle: "Couldn't load this",
      errorDescription: "Something went wrong loading this data. Please try again.",
      retryLabel: "Retry",
    },
    adminProducts: {
      heading: "Products",
      description: "Every product in the catalog, including drafts and archived items.",
      columnProduct: "Product",
      columnCategory: "Category",
      columnPrice: "Price",
      columnStock: "Stock",
      emptyTitle: "No products yet",
      emptyDescription: "Products will appear here once added to the catalog.",
      statusDraft: "Draft",
      statusActive: "Active",
      statusArchived: "Archived",
      formAddTitle: "Add Product",
      formEditTitle: "Edit Product",
      rowEdit: "Edit product",
      rowDelete: "Delete product",
      searchPlaceholder: "Search products…",
      sortPriceAsc: "Price (low to high)",
      sortPriceDesc: "Price (high to low)",
      statusFilterLabel: "Status",
    },
    adminServiceCategories: {
      heading: "Service Categories",
      description: "The top-level service categories customers browse under /services.",
      columnName: "Category",
      columnDescription: "Description",
      subserviceCount: "Subservices",
      emptyTitle: "No service categories yet",
      emptyDescription: "Service categories will appear here once added.",
      formAddTitle: "Add Service Category",
      formEditTitle: "Edit Service Category",
      rowEdit: "Edit category",
      rowDelete: "Delete category",
      searchPlaceholder: "Search service categories…",
    },
    adminSubservices: {
      heading: "Subservices",
      description: "Grouping nodes under each service category (e.g. \"RAM & SSD Upgrade\").",
      columnName: "Subservice",
      columnCategory: "Category",
      serviceCount: "Services",
      emptyTitle: "No subservices yet",
      emptyDescription: "Subservices will appear here once added.",
      formAddTitle: "Add Subservice",
      formEditTitle: "Edit Subservice",
      rowEdit: "Edit subservice",
      rowDelete: "Delete subservice",
      searchPlaceholder: "Search subservices…",
    },
    adminServices: {
      heading: "Services",
      description: "The bookable, priced services customers can request.",
      columnService: "Service",
      columnSubservice: "Subservice",
      columnPrice: "Price",
      columnDuration: "Duration",
      minutesSuffix: "min",
      emptyTitle: "No services yet",
      emptyDescription: "Bookable services will appear here once added.",
      statusActive: "Active",
      statusInactive: "Inactive",
      noPriceSet: "No price set",
      formAddTitle: "Add Service",
      formEditTitle: "Edit Service",
      rowEdit: "Edit service",
      rowDelete: "Delete service",
      searchPlaceholder: "Search services…",
      sortPriceAsc: "Price (low to high)",
      sortPriceDesc: "Price (high to low)",
      statusFilterLabel: "Status",
    },
    adminOrders: {
      heading: "Orders",
      description: "Every order placed through Checkout.",
      columnNumber: "Order",
      columnCustomer: "Customer",
      columnTotal: "Total",
      emptyTitle: "No orders yet",
      emptyDescription: "Orders placed at checkout will appear here.",
      detailTitle: "Order",
      itemsHeading: "Items",
      columnProduct: "Product",
      columnQuantity: "Qty",
      columnUnitPrice: "Unit Price",
      columnLineTotal: "Line Total",
      subtotalLabel: "Subtotal",
      discountLabel: "Discount",
      totalLabel: "Total",
      notesLabel: "Notes",
      customerInfoHeading: "Customer",
      placedOnLabel: "Placed on",
      searchPlaceholder: "Search order # or customer…",
      sortAmountAsc: "Amount (low to high)",
      sortAmountDesc: "Amount (high to low)",
      statusFilterLabel: "Status",
      dateFromLabel: "From",
      dateToLabel: "To",
      currentStatusLabel: "Current Status",
      updateStatusHeading: "Update Order Status",
      actionConfirmOrder: "Confirm Order",
      actionShipOrder: "Ship Order",
      actionConfirmDelivery: "Confirm Delivery",
      actionCancelOrder: "Cancel Order",
      deliveredNotice: "This order has been delivered.",
      cancelledNotice: "This order has been cancelled.",
      updateStatusDialogDescription: "Are you sure you want to change the order status from {from} to {to}?",
      updateStatusConfirmAction: "Confirm Change",
      cancelOrderDialogTitle: "Cancel Order",
      cancelOrderDialogDescription: "Are you sure you want to cancel this order? This action cannot be undone.",
      dialogBackLabel: "Back",
      timelineHeading: "Order Timeline",
      timelineOrderCreated: "Order Created",
    },
    adminBookings: {
      heading: "Bookings",
      description: "Every service booking placed by customers.",
      columnNumber: "Booking",
      columnCustomer: "Customer",
      columnService: "Service",
      emptyTitle: "No bookings yet",
      emptyDescription: "Service bookings will appear here.",
      detailTitle: "Booking",
      categoryLabel: "Category",
      subserviceLabel: "Type",
      serviceLabel: "Service",
      priceLabel: "Price",
      durationLabel: "Duration",
      scheduledDateLabel: "Scheduled date",
      scheduledTimeLabel: "Scheduled time",
      notesLabel: "Notes",
      photosHeading: "Photos",
      customerInfoHeading: "Customer",
      placedOnLabel: "Booked on",
      minutesSuffix: "min",
      noPriceSet: "No price set",
      noScheduleSet: "Not scheduled",
      searchPlaceholder: "Search booking # or customer…",
      statusFilterLabel: "Status",
      dateFromLabel: "From",
      dateToLabel: "To",
      currentStatusLabel: "Current Status",
      updateStatusHeading: "Update Booking Status",
      actionConfirmBooking: "Confirm Booking",
      actionCompleteService: "Mark as Completed",
      actionCancelBooking: "Cancel Booking",
      completedNotice: "This service has been completed.",
      cancelledNotice: "This booking has been cancelled.",
      confirmBookingDialogTitle: "Confirm Booking",
      updateStatusDialogDescription: "Are you sure you want to change the booking status from {from} to {to}?",
      updateStatusConfirmAction: "Confirm Change",
      completeServiceDialogTitle: "Complete Service",
      completeServiceDialogDescription: "Are you sure the maintenance/service has been completed?",
      completeServiceConfirmAction: "Confirm Completion",
      cancelBookingDialogTitle: "Cancel Booking",
      cancelBookingDialogDescription: "Are you sure you want to cancel this booking? This action cannot be undone.",
      dialogBackLabel: "Back",
      timelineHeading: "Booking Timeline",
      timelineBookingCreated: "Booking Created",
      timelineBookingCancelled: "Booking Cancelled",
    },
    adminCustomers: {
      heading: "Customers",
      description: "Everyone with a customer record — registered or guest checkout.",
      columnName: "Customer",
      columnContact: "Contact",
      columnOrders: "Orders",
      columnBookings: "Bookings",
      columnJoined: "Joined",
      emptyTitle: "No customers yet",
      emptyDescription: "Customer records are created automatically at Checkout or Booking.",
      detailTitle: "Customer",
      contactHeading: "Contact",
      activityHeading: "Order & Booking History",
      noActivity: "No orders or bookings yet.",
      rowView: "View customer",
      searchPlaceholder: "Search name or email…",
    },
    adminSettings: {
      heading: "Settings",
      description: "Admin account and store configuration.",
      profileHeading: "Your Admin Account",
      profileDescription: "Signed in as an administrator of Speed Core.",
      nameLabel: "Name",
      emailLabel: "Email",
      storeHeading: "Store Settings",
      storeDescription: "General store configuration, shared across the site.",
      storeNameLabel: "Store Name (English)",
      storeNameArLabel: "Store Name (Arabic)",
      contactEmailLabel: "Contact Email",
      contactPhoneLabel: "Contact Phone",
      contactAddressLabel: "Address (English)",
      contactAddressArLabel: "Address (Arabic)",
      currencyLabel: "Currency Code",
      maintenanceModeLabel: "Maintenance Mode",
      maintenanceModeHint: "When on, every customer-facing page shows a maintenance notice instead. Admin Login and the Dashboard stay accessible.",
      saveSuccessTitle: "Settings saved",
      lastUpdatedLabel: "Last updated",
      changePasswordHeading: "Change Password",
      changePasswordDescription: "Update the password for your own admin account.",
      currentPasswordLabel: "Current Password",
      newPasswordLabel: "New Password",
      confirmPasswordLabel: "Confirm New Password",
      changePasswordButton: "Change Password",
      changePasswordSuccessTitle: "Password changed",
      errorPasswordMismatch: "New password and confirmation don't match.",
      errorIncorrectCurrentPassword: "Current password is incorrect.",
    },
    adminForm: {
      addNew: "Add New",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      saving: "Saving…",
      cancel: "Cancel",
      backToList: "Back to list",
      nameLabel: "Name (English)",
      nameArLabel: "Name (Arabic)",
      descriptionLabel: "Description (English)",
      descriptionArLabel: "Description (Arabic)",
      priceLabel: "Price (IQD)",
      discountPriceLabel: "Discount Price (IQD)",
      discountPriceHint: "Optional — must be lower than the regular price.",
      stockQuantityLabel: "Stock Quantity",
      durationMinutesLabel: "Duration (minutes)",
      statusLabel: "Status",
      categoryLabel: "Category",
      categoryPlaceholder: "Select a category",
      subcategoryLabel: "Subcategory",
      subcategoryPlaceholder: "Select a subcategory",
      subcategoryNone: "None",
      imagesHeading: "Product Photos",
      imagesHint: "Upload real product photos — available once the product is saved.",
      newProductImagesHint: "Photos are uploaded automatically once you save this product below.",
      productIconLabel: "Product Icon",
      productIconHint: "Optional — picking an icon fills the Image URL field above with a matching illustration. It won't overwrite a real image URL you've already entered; clear that field first to switch icons.",
      productIconOptions: {
        laptop: "Laptop",
        desktop: "Desktop",
        monitor: "Monitor",
        smartphone: "Smartphone",
        headphones: "Headphones",
        accessories: "Accessories",
        camera: "Camera",
        keyboard: "Keyboard",
        mouse: "Mouse",
        printer: "Printer",
        network: "Network",
        server: "Server",
        harddrive: "Hard Drive",
        ups: "UPS",
        bagscases: "Bags & Cases",
        security: "Security & Surveillance",
      },
      requiredIndicator: "Required",
      deleteConfirmTitle: "Delete this item?",
      deleteConfirmDescription: "This action cannot be undone.",
      deleteConfirmAction: "Delete",
      deleting: "Deleting…",
      createSuccessTitle: "Created successfully",
      createSuccessImagesFailedTitle: "Product created, but photos failed to upload",
      createSuccessImagesFailedDescription: "You can add photos from this product's Edit page.",
      updateSuccessTitle: "Saved successfully",
      deleteSuccessTitle: "Deleted successfully",
      mutationErrorTitle: "Something went wrong",
      errorMissingFields: "Please fill in all required fields.",
      errorInvalidLength: "One of the fields is too long. Please shorten it and try again.",
      errorInvalidPrice: "Enter a valid price greater than zero and no more than 99,999,999.99.",
      errorInvalidDiscount: "The discount price must be positive, lower than the regular price, and no more than 99,999,999.99.",
      errorInvalidStock: "Enter a valid stock quantity (0 or more).",
      errorInvalidCategory: "Select a valid category.",
      errorInvalidSubcategory: "Select a subcategory that belongs to the chosen category.",
      errorNotFound: "This item no longer exists.",
      errorUnauthorized: "Your session has expired — please sign in again.",
      errorServer: "A server error occurred. Please try again.",
      errorHasDependents: "Can't delete this — it still has items that depend on it. Remove or reassign those first.",
      errorInvalidEmail: "Enter a valid email address.",
      errorInvalidPhone: "Enter a valid phone number.",
      notFoundTitle: "Page not found",
      notFoundDescription: "The admin page you're looking for doesn't exist or may have moved.",
      backToDashboard: "Back to Dashboard",
      updateStatusLabel: "Update Status",
      updateStatusButton: "Update",
      noTransitionsAvailable: "No further status changes are available.",
      statusUpdateSuccessTitle: "Status updated",
      cancelStatusConfirmTitle: "Cancel this?",
      cancelStatusConfirmDescription: "This marks it as cancelled. This action cannot be undone.",
    },
    imageGallery: {
      closeLabel: "Close",
      previousImageLabel: "Previous image",
      nextImageLabel: "Next image",
      primaryBadge: "Primary",
      addPhotosLabel: "Add Photos",
      uploadingLabel: "Uploading…",
      removePhotoLabel: "Remove photo",
      setPrimaryLabel: "Set as primary",
      moveEarlierLabel: "Move earlier",
      moveLaterLabel: "Move later",
      deletePhotoLabel: "Delete photo",
      deleteConfirmTitle: "Delete this photo?",
      deleteConfirmDescription: "This photo will be permanently removed.",
      dragToReorderHint: "Drag to reorder — the first photo is used as the primary image.",
      noPhotosYet: "No photos yet",
      errorInvalidFile: "Only JPG, PNG, or WebP images are allowed.",
      errorFileTooLarge: "Each photo must be under 5MB.",
      errorTooManyImages: "You've reached the photo limit.",
      errorUploadFailed: "Couldn't upload this photo. Please try again.",
    },
  },
  ar: {
    common: {
      loading: "جاري التحميل…",
    },
    nav: {
      home: "الرئيسية",
      products: "المنتجات",
      services: "الخدمات",
      booking: "الحجز",
      about: "من نحن",
      cart: "السلة",
      account: "الحساب",
      login: "تسجيل الدخول",
      bookService: "احجز خدمة",
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة",
      switchLanguageTo: "English",
    },
    hero: {
      eyebrow: "متجر تقنية متميز وصيانة معتمدة",
      headline: "أجهزة متميزة. صيانة احترافية.",
      headlineAccent: "مكان واحد تثق به.",
      description:
        "تسوّق أجهزة لابتوب وأجهزة مكتبية وملحقات مختارة بعناية، أو احجز فنيين معتمدين لصيانة سريعة وموثوقة. كل ما يحتاجه جهازك، بدقة قياس عالية.",
      ctaPrimary: "تسوّق المنتجات",
      ctaSecondary: "احجز خدمة",
      chips: ["فنيون معتمدون", "قطع وأجهزة أصلية", "تسليم سريع"],
      loading3d: "جاري تحميل المعاينة ثلاثية الأبعاد…",
    },
    categories: {
      eyebrow: "تصفح حسب الفئة",
      heading: "اعثر على ما تحتاجه بالضبط",
      description: "من أجهزة اللابتوب اليومية إلى معدات الشبكات — استكشف فئاتنا التقنية الأساسية.",
      viewAll: "عرض جميع المنتجات",
    },
    products: {
      eyebrow: "منتجات مختارة",
      heading: "تقنية مختارة بعناية، جاهزة للشحن",
      description: "تشكيلة مختارة من الأجهزة والمكوّنات التي يوصي بها فريقنا.",
      viewAll: "عرض جميع المنتجات",
      addToCart: "أضف إلى السلة",
      viewDetails: "عرض التفاصيل",
      inStock: "متوفر",
      lowStock: "كمية محدودة",
      outOfStock: "غير متوفر",
      discountBadge: "خصم",
      pageEyebrow: "تسوّق جميع المنتجات",
      pageHeading: "تقنية جاهزة للشحن",
      pageDescription:
        "ابحث وصفِّ في كامل تشكيلتنا من أجهزة اللابتوب والمكتبية والشاشات والتخزين ومعدات الشبكات والملحقات.",
      searchLabel: "البحث في المنتجات",
      searchPlaceholder: "ابحث بالاسم أو كلمة مفتاحية…",
      categoryLabel: "الفئة",
      allCategories: "كل الفئات",
      subcategoryLabel: "الفئة الفرعية",
      allSubcategories: "كل الفئات الفرعية",
      sortLabel: "ترتيب حسب",
      sortFeatured: "مميز",
      sortPriceAsc: "السعر: من الأقل إلى الأعلى",
      sortPriceDesc: "السعر: من الأعلى إلى الأقل",
      sortNameAsc: "الاسم: أ إلى ي",
      clearFilters: "مسح الفلاتر",
      resultsCountOne: "{count} منتج",
      resultsCountOther: "{count} منتج",
      loading: "جاري تحميل المنتجات…",
      emptyTitle: "لا توجد منتجات",
      emptyDescription: "جرّب كلمة بحث مختلفة أو امسح الفلاتر لعرض المزيد من المنتجات.",
      errorTitle: "تعذّر تحميل المنتجات",
      errorDescription: "حدث خطأ أثناء تحميل الكتالوج. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
      paginationPrevious: "السابق",
      paginationNext: "التالي",
      paginationPageOf: "صفحة {page} من {total}",
    },
    productDetails: {
      breadcrumbHome: "الرئيسية",
      breadcrumbProducts: "المنتجات",
      galleryLabel: "صور المنتج",
      viewLargerLabel: "عرض صورة أكبر",
      quantityLabel: "الكمية",
      decreaseQuantity: "تقليل الكمية",
      increaseQuantity: "زيادة الكمية",
      highlightsHeading: "أبرز المميزات",
      relatedHeading: "قد يعجبك أيضًا",
      notFoundTitle: "المنتج غير موجود",
      notFoundDescription: "قد يكون هذا المنتج قد أُزيل أو أن الرابط غير صحيح.",
      backToProducts: "العودة إلى المنتجات",
    },
    cart: {
      pageEyebrow: "سلة التسوق",
      pageHeading: "راجع مشترياتك",
      pageDescription: "تحقق من الكميات والأسعار قبل إتمام الشراء.",
      emptyTitle: "سلتك فارغة",
      emptyDescription: "تصفّح كتالوجنا وأضِف منتجات لتظهر هنا.",
      browseProducts: "تصفّح المنتجات",
      summaryHeading: "ملخص الطلب",
      subtotalLabel: "المجموع الفرعي",
      totalLabel: "الإجمالي",
      checkoutCta: "المتابعة إلى الدفع",
      continueShopping: "متابعة التسوق",
      quantityLabel: "الكمية",
      decreaseQuantity: "تقليل الكمية",
      increaseQuantity: "زيادة الكمية",
      removeItem: "إزالة المنتج",
      addedToCart: "تمت الإضافة",
      issueRemovedTitle: "لم يعد متوفرًا",
      issueRemovedDescription: "تمت إزالة هذا المنتج من الكتالوج.",
      issueOutOfStockTitle: "نفدت الكمية الآن",
      issueOutOfStockDescription: "نفدت كمية هذا المنتج منذ أن أضفته — أزِله للمتابعة.",
      issueQuantityAdjustedTitle: "تم تعديل الكمية",
      issueQuantityAdjustedDescription: "تبقّى {max} فقط في المخزون — قلّل الكمية للمتابعة.",
      checkoutBlockedNotice: "عالج المنتجات المُشار إليها أدناه قبل إتمام الدفع.",
    },
    checkout: {
      pageEyebrow: "الدفع",
      pageHeading: "أكمل طلبك",
      pageDescription: "أدخل بياناتك وسنؤكد طلبك خلال وقت قصير.",
      emptyCartTitle: "سلتك فارغة",
      emptyCartDescription: "أضِف منتجات إلى سلتك قبل إتمام الدفع.",
      backToCart: "العودة إلى السلة",
      customerInfoHeading: "بيانات العميل",
      fullNameLabel: "الاسم الكامل",
      fullNamePlaceholder: "اسمك الكامل",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "you@example.com",
      phoneLabel: "رقم الهاتف",
      phonePlaceholder: "+964 7XX XXX XXXX",
      orderSummaryHeading: "ملخص الطلب",
      subtotalLabel: "المجموع الفرعي",
      totalLabel: "الإجمالي",
      paymentNoteHeading: "الدفع",
      paymentNoteDescription:
        "الدفع الإلكتروني غير مُفعّل بعد — إرسال الطلب يسجّله كطلب أولي. سيتواصل فريقنا معك لتأكيد الدفع والتوصيل.",
      submitCta: "إرسال الطلب",
      submitting: "جارٍ إرسال طلبك…",
      errorRequired: "هذا الحقل مطلوب.",
      errorTooLong: "هذه القيمة طويلة جدًا.",
      errorEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      errorPhone: "أدخل رقم هاتف صحيحًا.",
      submissionErrorTitle: "تعذّر إرسال طلبك",
      submissionErrorDescription: "حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.",
      errorMaintenance: "المتجر متوقف مؤقتًا للصيانة. يرجى المحاولة بعد قليل.",
      retry: "إعادة المحاولة",
      successTitle: "تم استلام الطلب",
      successDescription: "شكرًا لك — استلمنا طلبك. سيتواصل فريقنا معك قريبًا لتأكيد الدفع والتوصيل.",
      orderNumberLabel: "رقم الطلب",
      continueShopping: "متابعة التسوق",
      backToHome: "العودة إلى الرئيسية",
    },
    booking: {
      pageEyebrow: "احجز خدمة",
      pageHeading: "حدّد موعد خدمتك",
      pageDescription: "أخبرنا بالوقت المناسب لك وسنؤكد موعدك.",
      noServiceTitle: "لم يتم اختيار خدمة",
      noServiceDescription: "اختر خدمة من كتالوجنا لبدء حجز موعد.",
      notFoundTitle: "الخدمة غير موجودة",
      notFoundDescription: "قد تكون هذه الخدمة قد أُزيلت أو أن الرابط غير صحيح.",
      unavailableTitle: "الخدمة غير متاحة حاليًا",
      unavailableDescription: "لا يمكن حجز هذه الخدمة حاليًا — يرجى اختيار خدمة أخرى.",
      browseServices: "تصفّح الخدمات",
      serviceSummaryHeading: "ملخص الخدمة",
      categoryLabel: "الفئة",
      subserviceLabel: "النوع",
      priceLabel: "السعر",
      durationLabel: "المدة",
      minutesLabel: "دقيقة",
      formHeading: "بياناتك",
      fullNameLabel: "الاسم الكامل",
      fullNamePlaceholder: "اسمك الكامل",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "you@example.com",
      phoneLabel: "رقم الهاتف",
      phonePlaceholder: "+964 7XX XXX XXXX",
      dateLabel: "التاريخ المفضل",
      timeLabel: "الوقت المفضل",
      notesLabel: "ملاحظات (اختياري)",
      notesPlaceholder: "أي شيء يجب أن يعرفه فنيّنا مسبقًا…",
      attachmentsLabel: "صور (اختياري)",
      attachmentsHint: "أضف صورًا للجهاز أو المشكلة ليستعد فنيّنا — حتى 5 صور، 5 ميغابايت لكل صورة.",
      submitCta: "تأكيد الحجز",
      submitting: "جارٍ إرسال حجزك…",
      errorRequired: "هذا الحقل مطلوب.",
      errorTooLong: "هذه القيمة طويلة جدًا.",
      errorEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      errorPhone: "أدخل رقم هاتف صحيحًا.",
      errorDate: "اختر التاريخ المفضل.",
      errorPastDate: "اختر تاريخًا اليوم أو بعده.",
      errorTime: "اختر الوقت المفضل.",
      errorAttachments: "حدث خطأ في الصور — حاول إزالتها وإضافتها مرة أخرى.",
      submissionErrorTitle: "تعذّر إرسال حجزك",
      submissionErrorDescription: "حدث خطأ أثناء إرسال حجزك. يرجى المحاولة مرة أخرى.",
      errorMaintenance: "المتجر متوقف مؤقتًا للصيانة. يرجى المحاولة بعد قليل.",
      retry: "إعادة المحاولة",
      successTitle: "تم تأكيد الحجز",
      successDescription: "شكرًا لك — استلمنا طلب حجزك. سيتواصل فريقنا معك لتأكيد موعدك.",
      bookingNumberLabel: "رقم الحجز",
      nextStepsHeading: "الخطوات التالية",
      nextStepsDescription: "سيتواصل معك أحد أعضاء فريقنا هاتفيًا أو عبر البريد الإلكتروني لتأكيد موعدك وأي تفاصيل أخيرة.",
      backToServices: "العودة إلى الخدمات",
      backToHome: "العودة إلى الرئيسية",
    },
    services: {
      eyebrow: "صيانة وإصلاح تقني",
      heading: "خدمة معتمدة، تُنجز بشكل صحيح من أول مرة",
      description:
        "من شاشة لابتوب مكسورة إلى إعداد شبكة كامل — يتولاها فنيونا بأسعار واضحة ومواعيد حقيقية.",
      viewAll: "عرض جميع الخدمات",
      learnMore: "اعرف المزيد",
      pageEyebrow: "صيانة وإصلاح تقني",
      pageHeading: "خدمة معتمدة، حسب الفئة",
      pageDescription:
        "اختر فئة خدمة لعرض أنواع خدماتها، ثم اختر الخدمة القابلة للحجز التي تحتاجها — مع أسعار بالدينار العراقي ومدة واضحة مسبقًا.",
      viewServicesCta: "عرض الخدمات",
      priceLabel: "السعر",
      durationLabel: "المدة",
      minutesLabel: "دقيقة",
      availableLabel: "متاحة",
      unavailableLabel: "غير متاحة حاليًا",
      bookServiceCta: "احجز هذه الخدمة",
      viewDetailsCta: "عرض التفاصيل",
      loading: "جاري تحميل الخدمات…",
      emptyTitle: "لا توجد خدمات بعد",
      emptyDescription: "لا تحتوي هذه الفئة على خدمات قابلة للحجز بعد — تحقق مرة أخرى قريبًا.",
    },
    serviceDetails: {
      breadcrumbHome: "الرئيسية",
      breadcrumbServices: "الخدمات",
      relatedHeading: "خدمات ذات صلة",
      notFoundTitle: "الخدمة غير موجودة",
      notFoundDescription: "قد تكون هذه الخدمة قد أُزيلت أو أن الرابط غير صحيح.",
      backToServices: "العودة إلى الخدمات",
    },
    whyChooseUs: {
      eyebrow: "لماذا Speed Core",
      heading: "مصمم لمن يعتمدون على أجهزتهم",
      description: "كل منتج وكل عملية إصلاح مبنية على نفس المعيار: أشخاص معتمدون، قطع أصلية، وتواصل واضح.",
      items: [
        {
          title: "فنيون معتمدون",
          description: "كل عملية إصلاح يقوم بها فنيون مدربون وموثوقون.",
        },
        {
          title: "قطع غيار أصلية",
          description: "نستخدم فقط قطعًا معتمدة من الشركات المصنعة وأجهزة مختبرة.",
        },
        {
          title: "أسعار واضحة",
          description: "عروض أسعار واضحة قبل البدء — دون رسوم مفاجئة.",
        },
        {
          title: "تسليم سريع",
          description: "تُنجز معظم الإصلاحات خلال 24 إلى 48 ساعة.",
        },
      ],
    },
    about: {
      eyebrow: "عن Speed Core",
      heading: "متجر تقنية ومركز صيانة تحت سقف واحد",
      description:
        "أطلقنا Speed Core لسد الفجوة بين شراء التقنية والحفاظ على عملها فعليًا. اليوم نبيع أجهزة مختارة بعناية ونصلّح الآلاف منها — بنفس الفريق ونفس المعايير.",
      cta: "تعرّف علينا أكثر",
    },
    aboutPage: {
      heroEyebrow: "عن Speed Core",
      heroHeading: "تقنية تعمل بكفاءة. خدمة تثق بها.",
      heroDescription:
        "يجمع Speed Core بين بيع التقنية والصيانة التقنية الاحترافية في مكان واحد — فريق واحد، ومعيار واحد، من المنتجات التي نبيعها إلى الإصلاحات التي ننفّذها.",
      overviewEyebrow: "عن Speed Core",
      overviewHeading: "متجر تقنية ومركز صيانة تحت سقف واحد",
      overviewParagraph1:
        "أطلقنا Speed Core لسد الفجوة بين شراء التقنية والحفاظ على عملها فعليًا. معظم المتاجر تبيعك جهازًا وتتوقف عند ذلك، ومعظم مراكز الصيانة لا تبيعك شيئًا على الإطلاق. نحن نقوم بالأمرين، بنفس الفريق ونفس المعايير.",
      overviewParagraph2:
        "كل جهاز لابتوب ومكتبي وملحق نبيعه مدعوم من نفس الفنيين الذين يقومون بإصلاحه — لذا عندما يحتاج جهازك إلى اهتمام، فأنت تتحدث مع أشخاص يفهمون إعدادك بالفعل.",
      whatWeDoEyebrow: "ماذا نقدّم",
      whatWeDoHeading: "قطاعان، بمعيار واحد",
      whatWeDoDescription: "من المنتجات على أرففنا إلى الإصلاحات على منضدة العمل، كل شيء يمر عبر نفس الفريق.",
      whatWeDoItems: [
        {
          title: "منتجات تقنية",
          description: "أجهزة لابتوب ومكتبية ومكوّنات وملحقات مختارة بعناية، جاهزة للشحن.",
        },
        {
          title: "صيانة الأجهزة",
          description: "تشخيص وإصلاح لأجهزة اللابتوب والمكتبية والطابعات باستخدام قطع أصلية.",
        },
        {
          title: "خدمات تقنية",
          description: "دعم للبرمجيات وأنظمة التشغيل والأداء إلى جانب كل إصلاح للأجهزة.",
        },
        {
          title: "الشبكات والبنية التحتية",
          description: "إعداد الراوتر وتحسين الواي فاي وتمديد الكابلات المنظمة للمنزل والمكتب.",
        },
        {
          title: "البيانات والبرمجيات",
          description: "تثبيت نظام التشغيل وتحديث التعريفات واسترجاع آمن للملفات المفقودة أو التالفة.",
        },
        {
          title: "أنظمة الأمان",
          description: "تركيب وصيانة كاميرات المراقبة والكاميرات الذكية وأنظمة الدخول.",
        },
      ],
      valuesEyebrow: "قيمنا",
      valuesHeading: "ما يوجّه كل عمل نقوم به",
      valuesItems: [
        { title: "الموثوقية", description: "عمل يُنجز بشكل صحيح، حتى لا يعود إلينا مرة أخرى." },
        { title: "الدقة", description: "تشخيص دقيق قبل أي إصلاح — وليس تخمينًا." },
        { title: "الشفافية", description: "أسعار واضحة ومواعيد صادقة، قبل أن نبدأ." },
        { title: "التحسين المستمر", description: "نواصل التدريب والاختبار، لترتفع معاييرنا باستمرار." },
      ],
      capabilitiesEyebrow: "الإمكانيات",
      capabilitiesHeading: "مدعومون بخدمة معتمدة، فئة تلو الأخرى",
      capabilitiesDescription: "كل منتج نبيعه مدعوم من نفس الفنيين المعتمدين وراء كتالوج خدماتنا.",
      capabilitiesCta: "عرض جميع الخدمات",
    },
    finalCta: {
      heading: "جاهز للترقية أو للإصلاح؟",
      description: "تصفّح أحدث منتجاتنا أو احجز فنيًا معتمدًا خلال دقائق.",
      ctaPrimary: "تسوّق المنتجات",
      ctaSecondary: "احجز خدمة",
    },
    footer: {
      tagline: "تقنية متميزة وصيانة تقنية معتمدة — تحت سقف واحد.",
      shopHeading: "المتجر",
      servicesHeading: "الخدمات",
      companyHeading: "الشركة",
      contactHeading: "تواصل معنا",
      hours: "السبت–الخميس، 9 صباحًا – 7 مساءً",
      rights: "جميع الحقوق محفوظة.",
    },
    auth: {
      loginEyebrow: "مرحبًا بعودتك",
      loginHeading: "سجّل الدخول إلى حسابك",
      loginDescription: "اطّلع على طلباتك وحجوزات خدماتك في مكان واحد.",
      registerEyebrow: "إنشاء حساب",
      registerHeading: "أنشئ حساب Speed Core الخاص بك",
      registerDescription: "تابع طلباتك وحجوزات خدماتك — باستخدام نفس البريد الإلكتروني الذي تسوّقت أو حجزت به.",
      nameLabel: "الاسم الكامل",
      namePlaceholder: "اسمك الكامل",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "you@example.com",
      phoneLabel: "رقم الهاتف",
      phonePlaceholder: "+964 7XX XXX XXXX",
      passwordLabel: "كلمة المرور",
      passwordPlaceholder: "8 أحرف على الأقل",
      loginCta: "تسجيل الدخول",
      loggingIn: "جارٍ تسجيل الدخول…",
      registerCta: "إنشاء حساب",
      registering: "جارٍ إنشاء حسابك…",
      noAccountPrompt: "ليس لديك حساب؟",
      registerLink: "أنشئ حسابًا",
      hasAccountPrompt: "لديك حساب بالفعل؟",
      loginLink: "تسجيل الدخول",
      errorRequired: "هذا الحقل مطلوب.",
      errorTooLong: "هذه القيمة طويلة جدًا.",
      errorEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      errorPhone: "أدخل رقم هاتف صحيحًا.",
      errorWeakPassword: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
      errorEmailTaken: "يوجد حساب مسجّل بهذا البريد الإلكتروني بالفعل — سجّل الدخول بدلاً من ذلك.",
      errorInvalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      errorRateLimited: "محاولات كثيرة جدًا. يرجى الانتظار بضع دقائق ثم المحاولة مرة أخرى.",
      errorServer: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    },
    account: {
      pageEyebrow: "حسابي",
      pageHeading: "الملف الشخصي",
      pageDescription: "معلومات حسابك.",
      accountInfoHeading: "معلومات الحساب",
      nameLabel: "الاسم",
      emailLabel: "البريد الإلكتروني",
      phoneLabel: "الهاتف",
      logoutCta: "تسجيل الخروج",
    },
    dashboardNav: {
      ariaLabel: "لوحة التحكم",
      overview: "نظرة عامة",
      ordersBookings: "الطلبات والحجوزات",
      profile: "الملف الشخصي",
      logout: "تسجيل الخروج",
    },
    dashboard: {
      pageEyebrow: "حسابي",
      pageHeading: "لوحة التحكم",
      pageDescription: "نظرة سريعة على طلباتك وحجوزاتك ونشاط حسابك.",
      statTotalOrders: "إجمالي الطلبات",
      statTotalBookings: "إجمالي الحجوزات",
      statActive: "نشطة / قيد التنفيذ",
      statNextAppointment: "الموعد القادم",
      noUpcomingAppointment: "لا يوجد موعد قادم",
      recentActivityHeading: "النشاط الأخير",
      viewAllCta: "عرض الكل",
    },
    accountActivity: {
      pageEyebrow: "حسابي",
      pageHeading: "الطلبات والحجوزات",
      pageDescription: "سجل طلبات منتجاتك وحجوزات خدماتك الكامل.",
      searchLabel: "البحث في الطلبات أو الحجوزات",
      searchPlaceholder: "ابحث في الطلبات أو الحجوزات…",
      tabAll: "الكل",
      tabProducts: "المنتجات",
      tabServices: "الخدمات",
      orderNumberLabel: "الطلب",
      bookingNumberLabel: "الحجز",
      dateLabel: "التاريخ",
      itemsCountOne: "{count} عنصر",
      itemsCountOther: "{count} عنصر",
      scheduledLabel: "الموعد",
      statusPending: "قيد الانتظار",
      statusConfirmed: "مؤكد",
      statusShipped: "تم الشحن",
      statusDelivered: "تم التسليم",
      statusCompleted: "مكتمل",
      statusCancelled: "ملغي",
      emptyOrdersTitle: "لا توجد طلبات منتجات بعد.",
      emptyOrdersDescription: "ستظهر طلبات منتجاتك هنا بمجرد أن تطلب أحدها.",
      emptyBookingsTitle: "لا توجد حجوزات خدمات بعد.",
      emptyBookingsDescription: "ستظهر حجوزات خدماتك هنا بمجرد أن تحجز إحداها.",
      browseServices: "تصفّح الخدمات",
      emptyAllTitle: "لا يوجد نشاط بعد",
      emptyAllDescription: "سيظهر نشاطك هنا بعد أن تقوم بطلب أو تحجز خدمة.",
      emptySearchTitle: "لا توجد نتائج مطابقة",
      emptySearchDescription: "جرّب كلمة بحث مختلفة أو بدّل التبويب.",
    },
    statusTimeline: {
      orderHeading: "حالة الطلب",
      bookingHeading: "حالة الحجز",
      cancelledNotice: "تم إلغاء هذا العنصر ولن يتم المتابعة به.",
      lastUpdatedLabel: "آخر تحديث",
      stepStatusDone: "مكتملة",
      stepStatusCurrent: "الخطوة الحالية",
      stepStatusUpcoming: "قادمة",
    },
    accountOrderDetails: {
      breadcrumbAccount: "لوحة التحكم",
      breadcrumbOrders: "الطلبات والحجوزات",
      heading: "الطلب",
      productLabel: "المنتج",
      unitPriceLabel: "سعر الوحدة",
      customerInfoHeading: "معلومات العميل",
      notFoundTitle: "الطلب غير موجود",
      notFoundDescription: "هذا الطلب غير موجود أو لا يخص هذا الحساب.",
      backToOrders: "العودة إلى الطلبات والحجوزات",
    },
    accountBookingDetails: {
      breadcrumbAccount: "لوحة التحكم",
      breadcrumbBookings: "الطلبات والحجوزات",
      heading: "الحجز",
      serviceLabel: "الخدمة",
      scheduledDateLabel: "تاريخ الموعد",
      scheduledTimeLabel: "وقت الموعد",
      notesLabel: "ملاحظات",
      photosHeading: "الصور",
      customerInfoHeading: "معلومات العميل",
      notFoundTitle: "الحجز غير موجود",
      notFoundDescription: "هذا الحجز غير موجود أو لا يخص هذا الحساب.",
      backToBookings: "العودة إلى الطلبات والحجوزات",
    },
    notFoundPage: {
      title: "الصفحة غير موجودة",
      description: "الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.",
      backToHome: "العودة إلى الرئيسية",
      browseProducts: "تصفح المنتجات",
    },
    maintenancePage: {
      title: "الموقع تحت الصيانة",
      heading: "سنعود قريبًا",
      description: "متجر Speed Core متوقف مؤقتًا لصيانة مجدولة. نعمل على إعادة الخدمة بأسرع وقت ممكن.",
      checkBackNote: "يرجى المحاولة مرة أخرى بعد قليل.",
    },
    adminNav: {
      ariaLabel: "تنقل لوحة التحكم",
      dashboard: "لوحة التحكم",
      products: "المنتجات",
      serviceCategories: "فئات الخدمات",
      subservices: "الخدمات الفرعية",
      services: "الخدمات",
      orders: "الطلبات",
      bookings: "الحجوزات",
      customers: "العملاء",
      settings: "الإعدادات",
      collapseSidebar: "طي القائمة الجانبية",
      expandSidebar: "توسيع القائمة الجانبية",
      logout: "تسجيل الخروج",
    },
    adminHeader: {
      breadcrumbHome: "لوحة التحكم",
      searchLabel: "بحث",
      searchPlaceholder: "ابحث في المنتجات والعملاء والطلبات…",
      searchingLabel: "جارٍ البحث…",
      searchNoResults: "لا توجد نتائج",
      searchProductsGroup: "المنتجات",
      searchCustomersGroup: "العملاء",
      searchOrdersGroup: "الطلبات",
      notificationsLabel: "الإشعارات",
      noNotifications: "لا توجد عناصر معلّقة حالياً.",
      pendingOrdersNotificationOne: "طلب واحد بانتظار التأكيد",
      pendingOrdersNotificationOther: "{count} طلبات بانتظار التأكيد",
      pendingBookingsNotificationOne: "حجز واحد بانتظار التأكيد",
      pendingBookingsNotificationOther: "{count} حجوزات بانتظار التأكيد",
      profileMenuLabel: "قائمة حساب المسؤول",
      switchLanguageTo: "English",
      openMenu: "فتح قائمة التنقل",
      closeMenu: "إغلاق قائمة التنقل",
      openSearch: "فتح البحث",
      closeSearch: "إغلاق البحث",
    },
    adminDashboard: {
      eyebrow: "نظرة عامة",
      heading: "لوحة التحكم",
      description: "لقطة لحظية حقيقية لنشاط المتجر، مستمدة مباشرة من قاعدة البيانات.",
      statRevenue: "إجمالي الإيرادات",
      statOrders: "إجمالي الطلبات",
      statBookings: "إجمالي الحجوزات",
      statCustomers: "إجمالي العملاء",
      statProducts: "المنتجات النشطة",
      statPendingOrders: "طلبات قيد الانتظار",
      statPendingBookings: "حجوزات قيد الانتظار",
      chartHeading: "الطلبات والحجوزات والإيرادات",
      chartDescription: "آخر 14 يوماً",
      chartOrdersLegend: "الطلبات",
      chartBookingsLegend: "الحجوزات",
      chartRevenueLegend: "الإيرادات",
      chartEmptyTitle: "لا يوجد نشاط بعد",
      chartEmptyDescription: "ستظهر هنا الطلبات والحجوزات التي تمت خلال آخر 14 يوماً.",
      recentOrdersHeading: "أحدث الطلبات",
      recentBookingsHeading: "أحدث الحجوزات",
      viewAll: "عرض الكل",
      emptyOrdersTitle: "لا توجد طلبات بعد",
      emptyOrdersDescription: "ستظهر هنا الطلبات الجديدة عند إتمامها.",
      emptyBookingsTitle: "لا توجد حجوزات بعد",
      emptyBookingsDescription: "ستظهر هنا حجوزات الخدمات الجديدة.",
      quickActionsHeading: "إجراءات سريعة",
      quickActionProducts: "إدارة المنتجات",
      quickActionOrders: "عرض الطلبات",
      quickActionBookings: "عرض الحجوزات",
      quickActionCustomers: "عرض العملاء",
    },
    adminCommon: {
      columnStatus: "الحالة",
      columnDate: "التاريخ",
      columnActions: "الإجراءات",
      crudComingSoonTitle: "التعديل قريباً",
      crudComingSoonDescription:
        "يعرض هذا القسم حالياً بيانات حقيقية ومباشرة من قاعدة البيانات. نماذج الإضافة والتعديل والحذف قيد الإنشاء حالياً.",
      totalCountOne: "عنصر واحد",
      totalCountOther: "{count} عناصر",
      searchLabel: "بحث",
      allLabel: "الكل",
      sortLabel: "ترتيب حسب",
      sortNewest: "الأحدث أولاً",
      sortOldest: "الأقدم أولاً",
      sortNameAsc: "الاسم (أ–ي)",
      resultsCountOne: "نتيجة واحدة",
      resultsCountOther: "{count} نتائج",
      errorTitle: "تعذّر التحميل",
      errorDescription: "حدث خطأ أثناء تحميل هذه البيانات. يرجى المحاولة مرة أخرى.",
      retryLabel: "إعادة المحاولة",
    },
    adminProducts: {
      heading: "المنتجات",
      description: "كل منتج في الكتالوج، بما في ذلك المسودات والمنتجات المؤرشفة.",
      columnProduct: "المنتج",
      columnCategory: "الفئة",
      columnPrice: "السعر",
      columnStock: "المخزون",
      emptyTitle: "لا توجد منتجات بعد",
      emptyDescription: "ستظهر المنتجات هنا بمجرد إضافتها إلى الكتالوج.",
      statusDraft: "مسودة",
      statusActive: "نشط",
      statusArchived: "مؤرشف",
      formAddTitle: "إضافة منتج",
      formEditTitle: "تعديل المنتج",
      rowEdit: "تعديل المنتج",
      rowDelete: "حذف المنتج",
      searchPlaceholder: "ابحث في المنتجات…",
      sortPriceAsc: "السعر (من الأقل)",
      sortPriceDesc: "السعر (من الأعلى)",
      statusFilterLabel: "الحالة",
    },
    adminServiceCategories: {
      heading: "فئات الخدمات",
      description: "الفئات الرئيسية للخدمات التي يتصفحها العملاء ضمن صفحة الخدمات.",
      columnName: "الفئة",
      columnDescription: "الوصف",
      subserviceCount: "الخدمات الفرعية",
      emptyTitle: "لا توجد فئات خدمات بعد",
      emptyDescription: "ستظهر فئات الخدمات هنا بمجرد إضافتها.",
      formAddTitle: "إضافة فئة خدمة",
      formEditTitle: "تعديل فئة الخدمة",
      rowEdit: "تعديل الفئة",
      rowDelete: "حذف الفئة",
      searchPlaceholder: "ابحث في فئات الخدمات…",
    },
    adminSubservices: {
      heading: "الخدمات الفرعية",
      description: "عقد تجميع ضمن كل فئة خدمة (مثل \"ترقية الذاكرة والتخزين\").",
      columnName: "الخدمة الفرعية",
      columnCategory: "الفئة",
      serviceCount: "الخدمات",
      emptyTitle: "لا توجد خدمات فرعية بعد",
      emptyDescription: "ستظهر الخدمات الفرعية هنا بمجرد إضافتها.",
      formAddTitle: "إضافة خدمة فرعية",
      formEditTitle: "تعديل الخدمة الفرعية",
      rowEdit: "تعديل الخدمة الفرعية",
      rowDelete: "حذف الخدمة الفرعية",
      searchPlaceholder: "ابحث في الخدمات الفرعية…",
    },
    adminServices: {
      heading: "الخدمات",
      description: "الخدمات القابلة للحجز والمسعّرة التي يمكن للعملاء طلبها.",
      columnService: "الخدمة",
      columnSubservice: "الخدمة الفرعية",
      columnPrice: "السعر",
      columnDuration: "المدة",
      minutesSuffix: "د",
      emptyTitle: "لا توجد خدمات بعد",
      emptyDescription: "ستظهر الخدمات القابلة للحجز هنا بمجرد إضافتها.",
      statusActive: "نشط",
      statusInactive: "غير نشط",
      noPriceSet: "لا يوجد سعر محدد",
      formAddTitle: "إضافة خدمة",
      formEditTitle: "تعديل الخدمة",
      rowEdit: "تعديل الخدمة",
      rowDelete: "حذف الخدمة",
      searchPlaceholder: "ابحث في الخدمات…",
      sortPriceAsc: "السعر (من الأقل)",
      sortPriceDesc: "السعر (من الأعلى)",
      statusFilterLabel: "الحالة",
    },
    adminOrders: {
      heading: "الطلبات",
      description: "كل طلب تم إتمامه عبر صفحة الدفع.",
      columnNumber: "الطلب",
      columnCustomer: "العميل",
      columnTotal: "الإجمالي",
      emptyTitle: "لا توجد طلبات بعد",
      emptyDescription: "ستظهر هنا الطلبات التي تتم عبر صفحة الدفع.",
      detailTitle: "الطلب",
      itemsHeading: "العناصر",
      columnProduct: "المنتج",
      columnQuantity: "الكمية",
      columnUnitPrice: "سعر الوحدة",
      columnLineTotal: "إجمالي السطر",
      subtotalLabel: "المجموع الفرعي",
      discountLabel: "الخصم",
      totalLabel: "الإجمالي",
      notesLabel: "ملاحظات",
      customerInfoHeading: "العميل",
      placedOnLabel: "تاريخ الطلب",
      searchPlaceholder: "ابحث برقم الطلب أو اسم العميل…",
      sortAmountAsc: "المبلغ (من الأقل)",
      sortAmountDesc: "المبلغ (من الأعلى)",
      statusFilterLabel: "الحالة",
      dateFromLabel: "من",
      dateToLabel: "إلى",
      currentStatusLabel: "الحالة الحالية",
      updateStatusHeading: "تحديث حالة الطلب",
      actionConfirmOrder: "تأكيد الطلب",
      actionShipOrder: "تجهيز/شحن الطلب",
      actionConfirmDelivery: "تأكيد التسليم",
      actionCancelOrder: "إلغاء الطلب",
      deliveredNotice: "تم تسليم الطلب",
      cancelledNotice: "تم إلغاء الطلب",
      updateStatusDialogDescription: "هل أنت متأكد من تغيير حالة الطلب من: {from} إلى: {to}؟",
      updateStatusConfirmAction: "تأكيد التغيير",
      cancelOrderDialogTitle: "إلغاء الطلب",
      cancelOrderDialogDescription: "هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.",
      dialogBackLabel: "رجوع",
      timelineHeading: "الجدول الزمني للطلب",
      timelineOrderCreated: "تم إنشاء الطلب",
    },
    adminBookings: {
      heading: "الحجوزات",
      description: "كل حجز خدمة قام به العملاء.",
      columnNumber: "الحجز",
      columnCustomer: "العميل",
      columnService: "الخدمة",
      emptyTitle: "لا توجد حجوزات بعد",
      emptyDescription: "ستظهر هنا حجوزات الخدمات.",
      detailTitle: "الحجز",
      categoryLabel: "الفئة",
      subserviceLabel: "النوع",
      serviceLabel: "الخدمة",
      priceLabel: "السعر",
      durationLabel: "المدة",
      scheduledDateLabel: "تاريخ الموعد",
      scheduledTimeLabel: "وقت الموعد",
      notesLabel: "ملاحظات",
      photosHeading: "الصور",
      customerInfoHeading: "العميل",
      placedOnLabel: "تاريخ الحجز",
      minutesSuffix: "د",
      noPriceSet: "لا يوجد سعر محدد",
      noScheduleSet: "غير مجدول",
      searchPlaceholder: "ابحث برقم الحجز أو اسم العميل…",
      statusFilterLabel: "الحالة",
      dateFromLabel: "من",
      dateToLabel: "إلى",
      currentStatusLabel: "الحالة الحالية",
      updateStatusHeading: "تحديث حالة الحجز",
      actionConfirmBooking: "تأكيد الحجز",
      actionCompleteService: "إكمال الصيانة",
      actionCancelBooking: "إلغاء الحجز",
      completedNotice: "تم إكمال الخدمة",
      cancelledNotice: "تم إلغاء الحجز",
      confirmBookingDialogTitle: "تأكيد الحجز",
      updateStatusDialogDescription: "هل أنت متأكد من تغيير حالة الحجز من: {from} إلى: {to}؟",
      updateStatusConfirmAction: "تأكيد التغيير",
      completeServiceDialogTitle: "إكمال الخدمة",
      completeServiceDialogDescription: "هل أنت متأكد من أن الصيانة أو الخدمة قد اكتملت؟",
      completeServiceConfirmAction: "تأكيد الإكمال",
      cancelBookingDialogTitle: "إلغاء الحجز",
      cancelBookingDialogDescription: "هل أنت متأكد من إلغاء هذا الحجز؟ هذا الإجراء لا يمكن التراجع عنه.",
      dialogBackLabel: "رجوع",
      timelineHeading: "الجدول الزمني للحجز",
      timelineBookingCreated: "تم إنشاء الحجز",
      timelineBookingCancelled: "تم إلغاء الحجز",
    },
    adminCustomers: {
      heading: "العملاء",
      description: "كل من لديه سجل عميل — سواء مسجّل أو عبر الدفع كضيف.",
      columnName: "العميل",
      columnContact: "التواصل",
      columnOrders: "الطلبات",
      columnBookings: "الحجوزات",
      columnJoined: "تاريخ الانضمام",
      emptyTitle: "لا يوجد عملاء بعد",
      emptyDescription: "تُنشأ سجلات العملاء تلقائياً عند الدفع أو الحجز.",
      detailTitle: "العميل",
      contactHeading: "التواصل",
      activityHeading: "سجل الطلبات والحجوزات",
      noActivity: "لا توجد طلبات أو حجوزات بعد.",
      rowView: "عرض العميل",
      searchPlaceholder: "ابحث بالاسم أو البريد الإلكتروني…",
    },
    adminSettings: {
      heading: "الإعدادات",
      description: "حساب المسؤول وإعدادات المتجر.",
      profileHeading: "حساب المسؤول الخاص بك",
      profileDescription: "مسجّل الدخول كمسؤول في Speed Core.",
      nameLabel: "الاسم",
      emailLabel: "البريد الإلكتروني",
      storeHeading: "إعدادات المتجر",
      storeDescription: "الإعدادات العامة للمتجر، مشتركة عبر الموقع.",
      storeNameLabel: "اسم المتجر (إنجليزي)",
      storeNameArLabel: "اسم المتجر (عربي)",
      contactEmailLabel: "البريد الإلكتروني للتواصل",
      contactPhoneLabel: "هاتف التواصل",
      contactAddressLabel: "العنوان (إنجليزي)",
      contactAddressArLabel: "العنوان (عربي)",
      currencyLabel: "رمز العملة",
      maintenanceModeLabel: "وضع الصيانة",
      maintenanceModeHint: "عند التفعيل، تُعرض رسالة صيانة بدلاً من كل صفحة يراها العملاء. تسجيل دخول الأدمن ولوحة التحكم تبقى متاحة.",
      saveSuccessTitle: "تم حفظ الإعدادات",
      lastUpdatedLabel: "آخر تحديث",
      changePasswordHeading: "تغيير كلمة المرور",
      changePasswordDescription: "حدّث كلمة المرور الخاصة بحساب المسؤول الخاص بك.",
      currentPasswordLabel: "كلمة المرور الحالية",
      newPasswordLabel: "كلمة المرور الجديدة",
      confirmPasswordLabel: "تأكيد كلمة المرور الجديدة",
      changePasswordButton: "تغيير كلمة المرور",
      changePasswordSuccessTitle: "تم تغيير كلمة المرور",
      errorPasswordMismatch: "كلمة المرور الجديدة وتأكيدها غير متطابقين.",
      errorIncorrectCurrentPassword: "كلمة المرور الحالية غير صحيحة.",
    },
    adminForm: {
      addNew: "إضافة جديد",
      edit: "تعديل",
      delete: "حذف",
      save: "حفظ",
      saving: "جارٍ الحفظ…",
      cancel: "إلغاء",
      backToList: "العودة إلى القائمة",
      nameLabel: "الاسم (إنجليزي)",
      nameArLabel: "الاسم (عربي)",
      descriptionLabel: "الوصف (إنجليزي)",
      descriptionArLabel: "الوصف (عربي)",
      priceLabel: "السعر (د.ع)",
      discountPriceLabel: "سعر الخصم (د.ع)",
      discountPriceHint: "اختياري — يجب أن يكون أقل من السعر الأساسي.",
      stockQuantityLabel: "كمية المخزون",
      durationMinutesLabel: "المدة (بالدقائق)",
      statusLabel: "الحالة",
      categoryLabel: "الفئة",
      categoryPlaceholder: "اختر فئة",
      subcategoryLabel: "الفئة الفرعية",
      subcategoryPlaceholder: "اختر فئة فرعية",
      subcategoryNone: "بلا",
      imagesHeading: "صور المنتج",
      imagesHint: "ارفع صورًا حقيقية للمنتج — متاح بعد حفظ المنتج.",
      newProductImagesHint: "تُرفع الصور تلقائيًا بعد حفظ هذا المنتج أدناه.",
      productIconLabel: "أيقونة المنتج",
      productIconHint: "اختياري — اختيار أيقونة يعبي حقل رابط الصورة أعلاه بصورة توضيحية مطابقة. ما راح يستبدل رابط صورة حقيقي دخلته انت مسبقاً؛ امسح ذلك الحقل أولاً إذا تريد تغيير الأيقونة.",
      productIconOptions: {
        laptop: "لابتوب",
        desktop: "حاسوب مكتبي",
        monitor: "شاشة",
        smartphone: "هاتف ذكي",
        headphones: "سماعات",
        accessories: "إكسسوارات",
        camera: "كاميرا",
        keyboard: "لوحة مفاتيح",
        mouse: "ماوس",
        printer: "طابعة",
        network: "شبكة",
        server: "خادم",
        harddrive: "هارد ديسك",
        ups: "مزود طاقة لا انقطاعي (UPS)",
        bagscases: "حقائب وحافظات",
        security: "أمن ومراقبة",
      },
      requiredIndicator: "مطلوب",
      deleteConfirmTitle: "هل تريد حذف هذا العنصر؟",
      deleteConfirmDescription: "لا يمكن التراجع عن هذا الإجراء.",
      deleteConfirmAction: "حذف",
      deleting: "جارٍ الحذف…",
      createSuccessTitle: "تمت الإضافة بنجاح",
      createSuccessImagesFailedTitle: "تم إنشاء المنتج، لكن رفع الصور فشل",
      createSuccessImagesFailedDescription: "يمكنك إضافة الصور من صفحة تعديل هذا المنتج.",
      updateSuccessTitle: "تم الحفظ بنجاح",
      deleteSuccessTitle: "تم الحذف بنجاح",
      mutationErrorTitle: "حدث خطأ ما",
      errorMissingFields: "يرجى تعبئة جميع الحقول المطلوبة.",
      errorInvalidLength: "أحد الحقول طويل جدًا. يرجى اختصاره والمحاولة مرة أخرى.",
      errorInvalidPrice: "أدخل سعراً صحيحاً أكبر من صفر ولا يتجاوز 99,999,999.99.",
      errorInvalidDiscount: "يجب أن يكون سعر الخصم موجباً وأقل من السعر الأساسي ولا يتجاوز 99,999,999.99.",
      errorInvalidStock: "أدخل كمية مخزون صحيحة (0 أو أكثر).",
      errorInvalidCategory: "اختر فئة صحيحة.",
      errorInvalidSubcategory: "اختر فئة فرعية تابعة للفئة المحددة.",
      errorNotFound: "لم يعد هذا العنصر موجوداً.",
      errorUnauthorized: "انتهت جلستك — يرجى تسجيل الدخول مرة أخرى.",
      errorServer: "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.",
      errorHasDependents: "لا يمكن الحذف — ما زال يحتوي على عناصر تابعة له. أزل أو أعد تعيين تلك العناصر أولاً.",
      errorInvalidEmail: "أدخل بريداً إلكترونياً صحيحاً.",
      errorInvalidPhone: "أدخل رقم هاتف صحيحاً.",
      notFoundTitle: "الصفحة غير موجودة",
      notFoundDescription: "صفحة الإدارة التي تبحث عنها غير موجودة أو ربما تم نقلها.",
      backToDashboard: "العودة إلى لوحة التحكم",
      updateStatusLabel: "تحديث الحالة",
      updateStatusButton: "تحديث",
      noTransitionsAvailable: "لا توجد تغييرات حالة إضافية متاحة.",
      statusUpdateSuccessTitle: "تم تحديث الحالة",
      cancelStatusConfirmTitle: "هل تريد الإلغاء؟",
      cancelStatusConfirmDescription: "سيتم وضع علامة الإلغاء على هذا العنصر. لا يمكن التراجع عن هذا الإجراء.",
    },
    imageGallery: {
      closeLabel: "إغلاق",
      previousImageLabel: "الصورة السابقة",
      nextImageLabel: "الصورة التالية",
      primaryBadge: "الصورة الرئيسية",
      addPhotosLabel: "إضافة صور",
      uploadingLabel: "جارٍ الرفع…",
      removePhotoLabel: "إزالة الصورة",
      setPrimaryLabel: "تعيين كصورة رئيسية",
      moveEarlierLabel: "نقل للأمام",
      moveLaterLabel: "نقل للخلف",
      deletePhotoLabel: "حذف الصورة",
      deleteConfirmTitle: "حذف هذه الصورة؟",
      deleteConfirmDescription: "ستتم إزالة هذه الصورة نهائيًا.",
      dragToReorderHint: "اسحب لإعادة الترتيب — تُستخدم الصورة الأولى كصورة رئيسية.",
      noPhotosYet: "لا توجد صور بعد",
      errorInvalidFile: "يُسمح فقط بصور JPG أو PNG أو WebP.",
      errorFileTooLarge: "يجب ألا يتجاوز حجم كل صورة 5 ميغابايت.",
      errorTooManyImages: "لقد وصلت إلى الحد الأقصى لعدد الصور.",
      errorUploadFailed: "تعذّر رفع هذه الصورة. يرجى المحاولة مرة أخرى.",
    },
  },
};

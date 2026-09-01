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
    errorEmail: string;
    errorPhone: string;
    submissionErrorTitle: string;
    submissionErrorDescription: string;
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
    submitCta: string;
    submitting: string;
    errorRequired: string;
    errorEmail: string;
    errorPhone: string;
    errorDate: string;
    errorPastDate: string;
    errorTime: string;
    submissionErrorTitle: string;
    submissionErrorDescription: string;
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
    errorEmail: string;
    errorPhone: string;
    errorWeakPassword: string;
    errorEmailTaken: string;
    errorInvalidCredentials: string;
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
    activityCardTitle: string;
    activityCardDescription: string;
    viewActivityCta: string;
    logoutCta: string;
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
}

export const dictionaries: Record<Lang, Dictionary> = {
  en: {
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
      errorEmail: "Enter a valid email address.",
      errorPhone: "Enter a valid phone number.",
      submissionErrorTitle: "Couldn't place your order",
      submissionErrorDescription: "Something went wrong while submitting your order. Please try again.",
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
      submitCta: "Confirm Booking",
      submitting: "Submitting your booking…",
      errorRequired: "This field is required.",
      errorEmail: "Enter a valid email address.",
      errorPhone: "Enter a valid phone number.",
      errorDate: "Choose a preferred date.",
      errorPastDate: "Choose a date that's today or later.",
      errorTime: "Choose a preferred time.",
      submissionErrorTitle: "Couldn't submit your booking",
      submissionErrorDescription: "Something went wrong while submitting your booking. Please try again.",
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
      errorEmail: "Enter a valid email address.",
      errorPhone: "Enter a valid phone number.",
      errorWeakPassword: "Password must be at least 8 characters.",
      errorEmailTaken: "An account already exists for this email — log in instead.",
      errorInvalidCredentials: "Incorrect email or password.",
      errorServer: "Something went wrong. Please try again.",
    },
    account: {
      pageEyebrow: "My Account",
      pageHeading: "Account",
      pageDescription: "Your account information and activity.",
      accountInfoHeading: "Account Information",
      nameLabel: "Name",
      emailLabel: "Email",
      phoneLabel: "Phone",
      activityCardTitle: "My Orders & Bookings",
      activityCardDescription: "View your complete product order and service booking history.",
      viewActivityCta: "View Activity",
      logoutCta: "Log Out",
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
      breadcrumbAccount: "Account",
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
      breadcrumbAccount: "Account",
      breadcrumbBookings: "Orders & Bookings",
      heading: "Booking",
      serviceLabel: "Service",
      scheduledDateLabel: "Scheduled Date",
      scheduledTimeLabel: "Scheduled Time",
      notesLabel: "Notes",
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
  },
  ar: {
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
      errorEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      errorPhone: "أدخل رقم هاتف صحيحًا.",
      submissionErrorTitle: "تعذّر إرسال طلبك",
      submissionErrorDescription: "حدث خطأ أثناء إرسال طلبك. يرجى المحاولة مرة أخرى.",
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
      submitCta: "تأكيد الحجز",
      submitting: "جارٍ إرسال حجزك…",
      errorRequired: "هذا الحقل مطلوب.",
      errorEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      errorPhone: "أدخل رقم هاتف صحيحًا.",
      errorDate: "اختر التاريخ المفضل.",
      errorPastDate: "اختر تاريخًا اليوم أو بعده.",
      errorTime: "اختر الوقت المفضل.",
      submissionErrorTitle: "تعذّر إرسال حجزك",
      submissionErrorDescription: "حدث خطأ أثناء إرسال حجزك. يرجى المحاولة مرة أخرى.",
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
      errorEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      errorPhone: "أدخل رقم هاتف صحيحًا.",
      errorWeakPassword: "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.",
      errorEmailTaken: "يوجد حساب مسجّل بهذا البريد الإلكتروني بالفعل — سجّل الدخول بدلاً من ذلك.",
      errorInvalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      errorServer: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    },
    account: {
      pageEyebrow: "حسابي",
      pageHeading: "الحساب",
      pageDescription: "معلومات حسابك ونشاطك.",
      accountInfoHeading: "معلومات الحساب",
      nameLabel: "الاسم",
      emailLabel: "البريد الإلكتروني",
      phoneLabel: "الهاتف",
      activityCardTitle: "طلباتي وحجوزاتي",
      activityCardDescription: "اطّلع على سجل طلبات منتجاتك وحجوزات خدماتك الكامل.",
      viewActivityCta: "عرض النشاط",
      logoutCta: "تسجيل الخروج",
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
      statusCancelled: "ملغى",
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
      breadcrumbAccount: "الحساب",
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
      breadcrumbAccount: "الحساب",
      breadcrumbBookings: "الطلبات والحجوزات",
      heading: "الحجز",
      serviceLabel: "الخدمة",
      scheduledDateLabel: "تاريخ الموعد",
      scheduledTimeLabel: "وقت الموعد",
      notesLabel: "ملاحظات",
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
  },
};

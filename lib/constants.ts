export const BUSINESS = {
  name: "VCHUKI",
  legalName: "Vchuki Fashion Private Limited",
  gstin: "08XXXXX0000X1Z5", // TODO: Replace with real GSTIN
  cin: "U18101RJ2025PTC000000", // TODO: Replace with real CIN
  address: {
    street: "Jodhpur",
    city: "Jodhpur",
    state: "Rajasthan",
    zip: "342001",
    country: "India",
  },
  fullAddress: "Jodhpur, Rajasthan 342001, India",
  email: {
    support: "support@vchuki.com",
    hello: "hello@vchuki.com",
    care: "care@vchuki.com",
    business: "business@vchuki.com",
    returns: "returns@vchuki.com",
  },
  phone: "+91 92528 91189", // TODO: Replace with real phone number
  hours: "Monday to Saturday, 10:00 AM - 7:00 PM IST",
  // Only list accounts VCHUKI actually owns. instagram.com/vchuki is an unrelated private
  // personal account — linking to it sent shoppers to a stranger. Add other networks here
  // once the brand's own handle exists on them.
  social: {
    instagram: "https://www.instagram.com/vchukiofficial/",
  } as Record<string, string>,
  domain: "https://vchuki.com",
  founded: "2025",
  tagline: "Premium Linen Blend Shirts — Crafted in Jodhpur",
}

/** Cart value at which shipping becomes free (matches the cart and checkout pages). */
export const FREE_SHIPPING_THRESHOLD = 1599

/** Flat shipping fee below the free-shipping threshold. */
export const SHIPPING_FEE = 50

/** Extra fee for Cash on Delivery orders (must match app/api/orders/route.ts). */
export const COD_FEE = 50

/** Delivery promise shown at checkout — matches the shipping policy (3–7 business days). */
export const DELIVERY_DAYS = "3–7"

/** Honest fabric label used wherever a product has no composition set. Update to the exact blend ratio. */
export const DEFAULT_FABRIC = "Cotton-linen blend"

/** Messages rotated in the top announcement bar — edit here to change what shoppers see. */
export const ANNOUNCEMENTS = [
  "Free shipping on orders above ₹1,599",
  "Cash on Delivery available across India",
  "7-day easy returns & exchanges",
  "Handcrafted in Jodhpur · Premium cotton-linen",
]

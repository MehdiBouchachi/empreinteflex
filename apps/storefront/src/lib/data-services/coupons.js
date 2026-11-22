// Coupons are deliberately disabled in the retail MVP until discounts are applied server-side.
export async function validateCouponCode(){return {valid:false,reason:'unavailable',message:'Les coupons ne sont pas encore disponibles.',coupon:null};}

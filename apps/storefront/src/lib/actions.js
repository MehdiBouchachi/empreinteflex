"use server";
import { revalidatePath } from 'next/cache';
import {getProducts,getProductBySlug} from '@/lib/data-services/products';
import {findOrderByCode,getOrderByCode,getOrder,getOrders,createOrder} from '@/lib/data-services/orders';
import {getMainCategories,getAllCategories} from '@/lib/data-services/categories';
import {getAllDimensions} from '@/lib/data-services/dimensions';
import {getAllThicknesses} from '@/lib/data-services/thicknesses';
import {validateCouponCode} from '@/lib/data-services/coupons';
export async function getProductsAction(filters={}){return getProducts(filters)}
export async function getProductAction(slug){return getProductBySlug(slug)}
export async function trackOrderAction(code,phone){return findOrderByCode(code,phone)}
export async function getOrderAction(code,token){return getOrder(code,token)}
export async function getOrdersAction(){return getOrders()}
export async function checkoutOrderAction(data){const result=await createOrder(data);if(result.success){revalidatePath('/[local]/order-success','page');return result}throw new Error('Checkout failed')}
export async function getMainCategoriesAction(){return getMainCategories()}
export async function getAllCategoriesAction(){return getAllCategories()}
export async function getAllDimensionsAction(){return getAllDimensions()}
export async function getAllThicknessesAction(){return getAllThicknesses()}
export async function getOrderByCodeAction(code,token){return getOrderByCode(code,token)}
export async function validateCouponAction(code){return validateCouponCode(code)}

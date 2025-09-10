import cookie from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdFromToken } from './utils';
import { Cart } from 'lib/models/ecom/Cart';

export async function getCartIdFromRequest(req: NextApiRequest, res: NextApiResponse): Promise<string | null> {
  const user_id = getUserIdFromToken(req);
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  let cartIdFromCookie = cookies.cartId || null;

  if (user_id) {
    const userCart = await Cart.findOne({ user_id }).exec();

    if (userCart) {
      const cartIdFromDb = userCart._id.toString();

      if (cartIdFromCookie !== cartIdFromDb) {
        setCookie(res, 'cartId', cartIdFromDb);
      }

      return cartIdFromDb;
    }
  }

  return cartIdFromCookie;
}

interface CookieOptions {
  path?: string;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  secure?: boolean;
  domain?: string;
}

const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
};

export function setCookie(res: NextApiResponse, name: string, value: string): void {
  const cookieStr = cookie.serialize(name, value, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  res.setHeader('Set-Cookie', cookieStr);
}

export function deleteCookie(res: NextApiResponse, name: string): void {
  const cookieStr = cookie.serialize(name, '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
  });

  res.setHeader('Set-Cookie', cookieStr);
}


// setCookie(res, 'cartId', 'generated-cart-id');
// deleteCookie(res, 'cartId');
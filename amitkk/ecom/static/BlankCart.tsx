import { PageDetailProps } from '@amitkk/basic/types/page';
import SuggestProducts from '@amitkk/product/static/suggest-products';
import { SingleProductItemProps } from '@amitkk/product/types';
import Link from 'next/link';
import React from 'react';

export interface SuggestProps {
    relatedProducts: SingleProductItemProps[];
    details?: PageDetailProps;
}

export default function BlankCart({ relatedProducts = [], details }: SuggestProps) { 
  return (
    <>
        <div className="container py-5 md:py-12 text-center">
            <h1 className="mb-3 heading mb-5 text-center">Your Cart is Empty</h1>
            <Link href="/shop" className="btn mt-5 inline-block">Shop Now</Link>
        </div>

        <SuggestProducts data={relatedProducts}/>
    </>
  );
};

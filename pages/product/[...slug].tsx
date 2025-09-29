// pages > product > [...slug.tsx]

import { useState, useEffect } from "react";
import Image from "next/image";
// import ImageSlider from "../../amitkk/components/ImageSlider";

import {Stack,Typography,RadioGroup,FormControlLabel,Radio,Button,Grid,Card,CardMedia,IconButton,Collapse, Box, Chip,} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { apiRequest } from "@amitkk/basic/utils/utils";
import { ProductRawDocument, SkuProps } from "lib/models/types";
import FaqPanel from "@amitkk/basic/components/faq/FaqPanel";
import SuggestTestimonial from "@amitkk/basic/components/testimonial/suggest-testimonial";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import ShareMe from "@amitkk/basic/static/ShareMe";
import CommentPanel from "@amitkk/basic/components/comment/CommentPanel";
import { MUICarousel } from "@amitkk/basic/static/MUICarousel";
import QuantitySelector from "@amitkk/product/static/QuantitySelector";
import { sanitizeHtml } from "@amitkk/basic/static/Content";
import { useEcom } from "contexts/EcomContext";
import ReviewForm from "@amitkk/basic/components/review/ReviewForm";
import { ReviewProps } from "@amitkk/basic/types/page";
import ReviewPanel from "@amitkk/basic/components/review/ReviewPanel";
import BulkOrderModal from "@amitkk/ecom/static/BulkOrderModal";

interface ProductPageProps {
  product: ProductRawDocument;
  relatedContent: RelatedContent;
  reviews: ReviewProps[]
}

export default function ProductPage({ product, relatedContent, reviews }: ProductPageProps) {
  const { sendAction } = useEcom();

  const [aboutOpen, setAboutOpen] = useState(true);
  const [openBulkModal, setOpenBulkModal] = useState(false);
  // const [mounted, setMounted] = useState(false);
  const [activeImage, setActiveImage] = useState<any>(null);
  const images = Array.isArray(product?.medias) ? product.medias : [];
  const skus = Array.isArray(product?.skus) ? product.skus : [];
  const [selectedSku, setSelectedSku] = useState<SkuProps | null>(null);
  const [selectedFlavour, setSelectedFlavour] = useState("");

  useEffect(() => {
    // setMounted(true);
    if (product?.medias?.length) { setActiveImage(product.medias[0]); }
    if (product?.skus?.length) { setSelectedSku(product.skus[0] ); }
    if (product?.skus?.length && product.skus[0].flavors?.length ) { setSelectedFlavour( product.skus[0].flavors[0]._id as string ); }
  }, [product?.medias]);

  // if (!mounted) return null;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    cssEase: "linear",
    arrows: true,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1, centerMode: true, centerPadding: '60px', } },
      { breakpoint: 1024, settings: { slidesToShow: 3, slidesToScroll: 1, } }, 
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1, } },
    ]
  };

  const [quantity, setQuantity] = useState(1);
  useEffect(() => { setQuantity(1); }, [selectedSku]);

  const handleAddToCart = () => {
    sendAction('add_to_cart', {
      action: 'add_to_cart',
      sku_id: selectedSku?._id,
      quantity,
      flavor_id : selectedFlavour
    });
  };

  if (!product) {
    return <Typography variant="h4">Product not found</Typography>;
  }
  
  return (
    <>
      <Grid container spacing={4} sx={{ px: 2, py: 4, width: "85vw", mx: "auto" }} gap={4}>
        <Grid size={5}>
          <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <CardMedia sx={{ position: "relative", height: 570, width: "100%" }}>
              {activeImage?.path ? (
                <Image
                  src={activeImage.path}
                  alt={activeImage.alt || "Product Image"}
                  fill
                  style={{ objectFit: "cover", borderRadius: "8px", objectPosition: "center" }}
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
                  <Typography variant="subtitle1" color="text.secondary">No Image Available</Typography>
                </Box>
              )}
            </CardMedia>
          </Card>
          
          {images.length > 1 && sliderSettings && (
            <MUICarousel settings={sliderSettings}>
              {images.map((img: any, index: number) => (
                <Box key={index} sx={{ cursor: "pointer", p: 1, border: activeImage?._id === img._id ? "2px solid #ec407a" : "", borderRadius: 1 }} onClick={() => setActiveImage(img)}>
                  <Image src={img.path} alt={img.alt} width={100} height={100} style={{ objectFit: "cover", borderRadius: "8px" }}/>
                </Box>
              ))}
            </MUICarousel>
          )}
        </Grid>

        <Grid size={7} mt={4}>
          <Stack spacing={3} alignItems="flex-start">
            <Typography variant="h1" fontWeight="bold" gutterBottom sx={{ lineHeight: 1.2 }}>{product.name}</Typography>
            {selectedSku && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 2, zIndex: 2 }}>
                {selectedSku.eggless_id && typeof selectedSku.eggless_id === "object" && "name" in selectedSku.eggless_id && (
                  <Chip label={selectedSku.eggless_id?.name} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, py: 0.5, px: 1.5, color: 'common.white', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', '&:hover': { backgroundColor: 'primary.main' } }}/>
                )}
                {selectedSku.sugarfree_id && typeof selectedSku.sugarfree_id === "object" && "name" in selectedSku.sugarfree_id && (
                  <Chip label={selectedSku.sugarfree_id?.name} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, py: 0.5, px: 1.5, color: 'common.white', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', '&:hover': { backgroundColor: 'primary.main' } }}/>
                )}
                {selectedSku.gluttenfree_id && typeof selectedSku.gluttenfree_id === "object" && "name" in selectedSku.gluttenfree_id && (
                  <Chip label={selectedSku.gluttenfree_id?.name} size="small" sx={{ fontSize: '0.65rem', fontWeight: 600, py: 0.5, px: 1.5, color: 'common.white', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', '&:hover': { backgroundColor: 'primary.main' } }}/>
                )}
              </Box>
            )}

            <ShareMe/>
            {product.short_desc && ( <span dangerouslySetInnerHTML={{ __html: product.short_desc }} /> )}

            {selectedSku && (
              <>
                <RadioGroup row value={selectedSku?._id || ""} onChange={(e) => { const option = skus.find((opt) => opt._id.toString() === e.target.value); if (option) setSelectedSku(option); }}>
                  {skus.map((i) => (
                    <FormControlLabel key={i._id as string} value={i._id} control={<Radio sx={{ color: "#ec407a", "&.Mui-checked": { color: "#ec407a" } }} />} label={i.name} sx={{ border: "1px solid", mb: 3, borderColor: selectedSku?._id === i._id ? "#ec407a" : "grey.400", backgroundColor: selectedSku?._id === i._id ? "#f8bbd0" : "transparent", borderRadius: "8px", px: 2, mx: 1, "&:hover": { backgroundColor: "#fce4ec" } }} />
                  ))}
                </RadioGroup>

                {selectedSku.flavors?.length && (
                  <>
                    <Typography variant="h5" fontWeight="bold">Select Flavour</Typography>
                    <Stack direction="row" spacing={2}>
                      {selectedSku.flavors.map((flavour) => (
                        <Button key={flavour._id as string} variant={selectedFlavour === flavour._id ? "contained" : "outlined"} onClick={() => setSelectedFlavour(flavour._id as string)}
                          sx={{"&:hover": {backgroundColor: selectedFlavour === flavour._id ? "#f06292" : "#f8bbd0",},}}
                        >{flavour.name}</Button>
                      ))}
                    </Stack>
                  </>
                )}

                <Typography variant="h5" fontWeight="bold"> INR {selectedSku.price.toFixed(2)}</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                 <QuantitySelector value={quantity} minQuantity={1} onChange={setQuantity}/>
                  <Button onClick={handleAddToCart} variant="contained" sx={{ background: "linear-gradient(45deg, #f48fb1, #ec407a)", borderRadius: 2, px: 2, py: 1, fontSize: "1rem", "&:hover": { background: "linear-gradient(45deg, #ec407a, #f06292)" } }}>Add to Cart</Button>
                  <Button variant="contained" sx={{ background: "linear-gradient(45deg, #f48fb1, #ec407a)", borderRadius: 2, px: 2, py: 1, fontSize: "1rem", "&:hover": { background: "linear-gradient(45deg, #ec407a, #f06292)" } }}>Buy now</Button>
                </Stack>
              </>
            )}
          </Stack>
        </Grid>

        <Grid size={12}>
          <Button variant="contained" sx={{ background: "linear-gradient(45deg, #f48fb1, #ec407a)", borderRadius: 2, px: 2, py: 1, fontSize: "1rem", "&:hover": { background: "linear-gradient(45deg, #ec407a, #f06292)" } }} onClick={() => setOpenBulkModal(true)}>Bulk Order</Button>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight="medium" color="text.primary">About {product.name}</Typography>
            <IconButton size="small" onClick={() => setAboutOpen(!aboutOpen)} sx={{ borderRadius: "50%", border: "1px solid", borderColor: "#ec407a", width: 32, height: 32 }}>{aboutOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
          </Stack>
          <Collapse in={aboutOpen}>
             {product.long_desc && ( <span dangerouslySetInnerHTML={{ __html: product.long_desc }} /> )}
          </Collapse>
        </Grid>

        <Grid size={12}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>With this look</Typography>
        </Grid>

        <FaqPanel faq={relatedContent.faq} />
        <SuggestTestimonial testimonials={relatedContent.testimonials} />

        <ReviewPanel reviews={reviews} module="Product" module_id={product?._id}/>
        <SuggestProducts products={relatedContent.products} />
        <SuggestBlogs blogs={relatedContent.blogs} />

        <BulkOrderModal
          isOpen={openBulkModal}
          onClose={() => setOpenBulkModal(false)}
          product_id = {product?._id as string || ""}
          sku_id = {selectedSku?._id as string || ""}
          vendor_id = {product?.vendor_id as unknown as string || ""}
        />
      </Grid>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const slug = context.params.slug[0];
  const res = await apiRequest("get", `product/product?function=get_single_product_by_url&url=${slug}`);

  const meta = res?.data?.meta_id || { title: process.env.NEXT_PUBLIC_DEFAULT_TITLE, description: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION };
  const product = res?.data || null;
  const reviews = Array.isArray(res?.reviews) ? res.reviews : [];
  const relatedContent = res?.relatedContent || { faq: [], testimonials: [], blogs: [], products: [] };

  relatedContent.testimonials = relatedContent.testimonials.map((t: any) => ({
    ...t,
    content: typeof t.content === 'string' ? sanitizeHtml(t.content) : ''
  }));

  return { props: { product, meta, relatedContent, reviews } };
}
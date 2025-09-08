// pages > product > [...slug.tsx]

import { useState, useEffect } from "react";
import Image from "next/image";
// import ImageSlider from "../../amitkk/components/ImageSlider";

import {Stack,Typography,RadioGroup,FormControlLabel,Radio,Button,Grid,Card,CardMedia,IconButton,Collapse, Box, Chip,} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { FaqProps } from "@amitkk/basic/types/page";
import { apiRequest } from "@amitkk/basic/utils/utils";
import { ProductRawDocument, SkuProps } from "lib/models/types";
import FaqPanel from "@amitkk/basic/components/faq/FaqPanel";
import SuggestTestimonial from "@amitkk/basic/components/testimonial/suggest-testimonial";
import SuggestProducts from "@amitkk/product/static/suggest-products";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import ShareMe from "@amitkk/basic/static/ShareMe";
import CommentPanel from "@amitkk/basic/components/comment/CommentPanel";
import Content from "@amitkk/basic/static/Content";
import { MUICarousel } from "@amitkk/basic/static/MUICarousel";

interface ProductPageProps {
  product: ProductRawDocument;
  meta: {
    title: string;
    description: string;
  };
  relatedContent: RelatedContent;
}

export default function ProductPage({ product, meta, relatedContent }: ProductPageProps) {
  const { faq, testimonials, blogs, products } = relatedContent;
  const weightOptions = [
    { weight: "500g", price: 19.0 },
    { weight: "1kg", price: 34.0 },
  ];

  const [aboutOpen, setAboutOpen] = useState(true);  
  const [mounted, setMounted] = useState(false);
  const [activeImage, setActiveImage] = useState<any>(null);
  const images = Array.isArray(product?.medias) ? product.medias : [];
  const skus = Array.isArray(product?.skus) ? product.skus : [];
  const [selectedSku, setSelectedSku] = useState<SkuProps | null>(null);
  const [selectedFlavour, setSelectedFlavour] = useState("");

  useEffect(() => {
    setMounted(true);
    if (product?.medias?.length) { setActiveImage(product.medias[0]); }
    if (product?.skus?.length) { setSelectedSku(product.skus[0] ); }
    if (product?.skus?.length && product.skus[0].flavors?.length ) { setSelectedFlavour( product.skus[0].flavors[0]._id as string ); }
  }, [product?.medias]);

  if (!mounted) return null;

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

  console.log("skus", skus)
  console.log("selectedSku", selectedSku)

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
            <Content content={product.short_desc}/>

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

                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h5" fontWeight="bold"> INR {selectedSku.price.toFixed(2)}</Typography>
                  <Button variant="contained" sx={{ background: "linear-gradient(45deg, #f48fb1, #ec407a)", borderRadius: 2, px: 2, py: 1, fontSize: "1rem", "&:hover": { background: "linear-gradient(45deg, #ec407a, #f06292)" } }}>Add to Cart</Button>
                </Stack>
              </>
            )}
          </Stack>
        </Grid>

        <Grid size={12}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight="medium" color="text.primary">About {product.name}</Typography>
            <IconButton size="small" onClick={() => setAboutOpen(!aboutOpen)} sx={{ borderRadius: "50%", border: "1px solid", borderColor: "#ec407a", width: 32, height: 32 }}>{aboutOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}</IconButton>
          </Stack>
          <Collapse in={aboutOpen}>
             <Content content={product.long_desc}/>
          </Collapse>
        </Grid>

        <Grid size={12}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>With this look</Typography>
          {/* <ImageSlider /> */}
        </Grid>
        
        <CommentPanel module="Product" module_id={product._id} module_name={product?.name}/>
        <FaqPanel faq={relatedContent.faq} />
        <SuggestTestimonial testimonials={relatedContent.testimonials} />
        <SuggestProducts products={relatedContent.products} />
        <SuggestBlogs blogs={relatedContent.blogs} />
      </Grid>

    </>
  );
}

export async function getServerSideProps(context: any) {
  const slug = context.params.slug[0];

  const res = await apiRequest("get", `product/product?function=get_single_product_by_url&url=${slug}`);

  const meta = res?.data?.meta_id || { title: process.env.NEXT_PUBLIC_DEFAULT_TITLE, description: process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION };
  const product = res?.data || null;
  const relatedContent = res?.relatedContent || { faq: [], testimonials: [], blogs: [], products: [] };
  return { props: { product, meta, relatedContent } };
}
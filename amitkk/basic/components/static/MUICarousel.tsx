import { useState, Children, ReactElement, useEffect } from 'react';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

interface CarouselSettings {
  dots?: boolean;
  infinite?: boolean;
  centerMode?: boolean;
  speed?: number;
  slidesToShow: number;
  slidesToScroll: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  centerPadding?: string;
  cssEase?: string;
  arrows?: boolean;
  responsive?: Array<{
    breakpoint: number;
    settings: Omit<CarouselSettings, 'responsive'>;
  }>;
}

interface CarouselProps {
  children: ReactElement[];
  settings: CarouselSettings;
}

export function MUICarousel({ children, settings }: CarouselProps) {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Handle responsive settings
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.down('lg'));
  
  let currentSettings = { ...settings };
  if (settings.responsive) {
    if (isMobile) {
      currentSettings = { ...currentSettings, ...settings.responsive[0].settings };
    } else if (isTablet) {
      currentSettings = { ...currentSettings, ...settings.responsive[1].settings };
    } else if (isLaptop) {
      currentSettings = { ...currentSettings, ...settings.responsive[2].settings };
    }
  }

  const maxIndex = Math.ceil(Children.count(children) / currentSettings.slidesToShow) - 1;

  const next = () => setActiveIndex((prev) => 
    currentSettings.infinite && prev >= maxIndex ? 0 : Math.min(prev + 1, maxIndex)
  );
  
  const prev = () => setActiveIndex((prev) => 
    currentSettings.infinite && prev <= 0 ? maxIndex : Math.max(prev - 1, 0)
  );

  // Auto-play effect
  const [autoPlay, setAutoPlay] = useState(currentSettings.autoplay);
  
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      next();
    }, currentSettings.autoplaySpeed);
    
    return () => clearInterval(interval);
  }, [autoPlay, activeIndex]);

  return (
    <Box sx={{ 
      width: '100%',
      position: 'relative',
      '&:hover': {
        '& .carousel-arrow': {
          opacity: currentSettings.arrows ? 1 : 0
        }
      }
    }}>
      <Box sx={{ 
        display: 'flex',
        overflow: 'hidden',
        gap: 2,
        transition: `transform ${currentSettings.speed}ms ${currentSettings.cssEase}`
      }}>
        {Children?.map(children, (child, index) => (
          <Box sx={{ 
            minWidth: `calc(${100/currentSettings.slidesToShow}% - ${theme.spacing(2)})`,
            transform: `translateX(-${activeIndex * 100}%)`,
            transition: `transform ${currentSettings.speed}ms ${currentSettings.cssEase}`,
            px: 1,
            py:3,
            ...(currentSettings.centerMode && {
              paddingLeft: currentSettings.centerPadding,
              paddingRight: currentSettings.centerPadding
            })
          }}>
            {child}
          </Box>
        ))}
      </Box>
      
      {currentSettings.arrows && (
        <>
          <IconButton 
            onClick={prev}
            className="carousel-arrow"
            sx={{ 
              position: 'absolute', 
              left: -20, 
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 3,
              opacity: 0,
              transition: 'all 0.3s ease',
              '&:hover': { 
                bgcolor: 'primary.main',
                color: 'common.white',
              }
            }}
          >
            <KeyboardArrowLeft fontSize="large" />
          </IconButton>
          
          <IconButton 
            onClick={next}
            className="carousel-arrow"
            sx={{ 
              position: 'absolute', 
              right: -20, 
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 3,
              opacity: 0,
              transition: 'all 0.3s ease',
              '&:hover': { 
                bgcolor: 'primary.main',
                color: 'common.white',
              }
            }}
          >
            <KeyboardArrowRight fontSize="large" />
          </IconButton>
        </>
      )}
    </Box>
  );
}
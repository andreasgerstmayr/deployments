import React, { useEffect, useState } from 'react';
import { ImageList, ImageListItem, ImageListItemBar, Rating } from '@mui/material';

export function Images() {
  return (
    <ImageList variant="masonry" cols={3} gap={20}>
      {itemData.map((item, i) => (
        <Image key={i} {...item} />
      ))}
    </ImageList>
  );
}

interface ImageProps {
  id: number;
  img: string;
  title: string;
  author: string;
}

function Image(props: ImageProps) {
  const [rating, setRating] = useState<number | null>(null);
  
  useEffect(() => {
    async function loadRating() {
      const result = await fetch(`/api/rating/${props.id}`);
      const data = await result.json();
      setRating(data.rating);
    }
    loadRating();
  }, [rating]);

  async function updateRating(newValue: number|null) {
    await fetch(`/api/rating/${props.id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({rating: newValue})
    });
    setRating(newValue);
  }

  return (
    <ImageListItem key={props.img}>
      <img
        srcSet={`${props.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
        src={`${props.img}?w=248&fit=crop&auto=format`}
        alt={props.title}
        loading="lazy"
      />
      <ImageListItemBar
        title={props.title}
        subtitle={<span style={{whiteSpace: 'wrap'}}>Photo by {props.author} on Unsplash</span>}
        actionIcon={
          <Rating
            sx={{ my: 1 }}
            value={rating}
            onChange={(_event, newValue) => {
              updateRating(newValue);
            }}
          />
        }
        position="below"
      />
    </ImageListItem>
  );
}

const itemData = [
  {
    id: 1,
    img: 'https://images.unsplash.com/photo-1549388604-817d15aa0110',
    title: 'Bed',
    author: 'swabdesign',
  },
  {
    id: 2,
    img: 'https://images.unsplash.com/photo-1525097487452-6278ff080c31',
    title: 'Books',
    author: 'Pavel Nekoranec',
  },
  {
    id: 3,
    img: 'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6',
    title: 'Sink',
    author: 'Charles Deluvio',
  },
  {
    id: 4,
    img: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3',
    title: 'Kitchen',
    author: 'Christian Mackie',
  },
  {
    id: 5,
    img: 'https://images.unsplash.com/photo-1588436706487-9d55d73a39e3',
    title: 'Blinds',
    author: 'Darren Richardson',
  },
  {
    id: 6,
    img: 'https://images.unsplash.com/photo-1574180045827-681f8a1a9622',
    title: 'Chairs',
    author: 'Taylor Simpson',
  },
  {
    id: 7,
    img: 'https://images.unsplash.com/photo-1530731141654-5993c3016c77',
    title: 'Laptop',
    author: 'Ben Kolde',
  },
  {
    id: 8,
    img: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61',
    title: 'Doors',
    author: 'Philipp Berndt',
  },
  {
    id: 9,
    img: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7',
    title: 'Coffee',
    author: 'Jen P.',
  },
  {
    id: 10,
    img: 'https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee',
    title: 'Storage',
    author: 'Douglas Sheppard',
  },
  {
    id: 11,
    img: 'https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62',
    title: 'Candle',
    author: 'Fi Bell',
  },
  {
    id: 12,
    img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4',
    title: 'Coffee table',
    author: 'Hutomo Abrianto',
  },
];

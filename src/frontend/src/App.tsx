import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Images } from './ImageList';

export function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          My Photography Website
        </Typography>
        <Images />
      </Box>
    </Container>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Sección: Importaciones de Material-UI
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Slider,
} from '@mui/material';

// Sección: Iconos de Material-UI
import SearchRounded from '@mui/icons-material/SearchRounded';
import TuneRounded from '@mui/icons-material/TuneRounded';

const API_URL = "https://salonladybarberbackend.onrender.com";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BarraBusqueda = () => {

  const navigate = useNavigate();

  const [palabraClave, setPalabraClave] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [avanzadoAbierto, setAvanzadoAbierto] = useState(false);
  const [rangoPrecio, setRangoPrecio] = useState([0, 1000]);

  const [insumos, setInsumos] = useState([]);

  // ============================================
  // Cargar insumos desde backend
  // ============================================

  useEffect(() => {
    const cargarInsumos = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/insumos`);
        if (Array.isArray(res.data)) {
          setInsumos(res.data);
        } else {
          console.warn("Respuesta inesperada en /api/insumos:", res.data);
          setInsumos([]);
        }
      } catch (error) {
        console.error('Error cargando insumos', error);
        setInsumos([]);
      }
    };

    cargarInsumos();
  }, []);

  // ============================================
  // Filtrado
  // ============================================

  const filtrarItems = useMemo(() => {

    const insumosArr = Array.isArray(insumos) ? insumos : [];
    let list = [...insumosArr];

    const clave = palabraClave.trim().toLowerCase();

    if (clave) {
      list = list.filter(
        (item) =>
          item.nombre.toLowerCase().includes(clave) ||
          (item.descripcion &&
            item.descripcion.toLowerCase().includes(clave))
      );
    }

    list = list.filter(
      (item) =>
        Number(item.precioUnitario) >= rangoPrecio[0] &&
        Number(item.precioUnitario) <= rangoPrecio[1]
    );

    return list;

  }, [palabraClave, rangoPrecio, insumos]);

  // ============================================
  // Handlers
  // ============================================

  const handleBuscar = () => {
    setAbierto(true);
  };

  const handleCerrar = () => {
    setAbierto(false);
  };

  const handleSeleccion = (item) => {
    setAbierto(false);
    setPalabraClave('');
    navigate('/');
    // En el futuro puedes navegar al detalle del insumo
  };

  const aplicarAvanzado = () => {
    setAvanzadoAbierto(false);
  };

  // ============================================
  // Render
  // ============================================

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          size="medium"
          placeholder="Buscar insumos..."
          value={palabraClave}
          onChange={(e) => setPalabraClave(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          sx={{
            width: { xs: 190, sm: 260 },
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255,255,255,0.1)',
              color: '#F9FAFB',
              '& fieldset': { borderColor: 'rgba(212,175,55,0.4)' },
              '&:hover fieldset': { borderColor: '#D4AF37' },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(255,255,255,0.7)',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ color: '#D4AF37', fontSize: 26 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  size="medium"
                  onClick={() => setAvanzadoAbierto(true)}
                  sx={{ color: '#D4AF37' }}
                  title="Búsqueda avanzada"
                >
                  <TuneRounded />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          size="medium"
          variant="contained"
          onClick={handleBuscar}
          sx={{
            bgcolor: '#D4AF37',
            color: '#1A252F',
            '&:hover': { bgcolor: '#c4a030' },
          }}
        >
          Buscar
        </Button>
      </Box>

      {/* Modal de resultados */}
      <Dialog
        open={abierto}
        onClose={handleCerrar}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: '#2C3E50', color: '#F9FAFB' }}>
          Resultados de búsqueda
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {filtrarItems.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              No hay resultados para "{palabraClave}".
            </Box>
          ) : (
            <List>
              {filtrarItems.map((item) => (
                <ListItemButton
                  key={item.id}
                  onClick={() => handleSeleccion(item)}
                >
                  <ListItemText
                    primary={item.nombre}
                    secondary={`$${item.precioUnitario} · Stock: ${item.stockActual}`}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal búsqueda avanzada */}
      <Dialog
        open={avanzadoAbierto}
        onClose={() => setAvanzadoAbierto(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ bgcolor: '#2C3E50', color: '#F9FAFB' }}>
          Búsqueda avanzada
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Palabra clave
          </Typography>

          <TextField
            fullWidth
            size="small"
            value={palabraClave}
            onChange={(e) => setPalabraClave(e.target.value)}
            placeholder="Ej: shampoo, tijeras..."
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Rango de precio ($)
          </Typography>

          <Slider
            value={rangoPrecio}
            onChange={(_, v) => setRangoPrecio(v)}
            valueLabelDisplay="auto"
            min={0}
            max={5000}
            sx={{ color: '#D4AF37', mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={() => setAvanzadoAbierto(false)}>
              Cancelar
            </Button>

            <Button
              variant="contained"
              onClick={aplicarAvanzado}
              sx={{
                bgcolor: '#D4AF37',
                color: '#1A252F',
                '&:hover': { bgcolor: '#c4a030' },
              }}
            >
              Aplicar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarraBusqueda;

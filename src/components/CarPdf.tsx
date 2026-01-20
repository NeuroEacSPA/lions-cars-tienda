import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';
import type { Vehiculo } from '../services/api';

// --- ESTILOS PREMIUM (Lions Cars V3) ---
const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 0, fontFamily: 'Helvetica' },
  
  // HEADER
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: '#0a0a0a', 
    paddingHorizontal: 30,
    paddingVertical: 20,
    height: 85
  },
  brandTitle: { fontSize: 22, fontWeight: 'black', color: '#FFFFFF', textTransform: 'uppercase' },
  brandSubtitle: { fontSize: 8, color: '#E8B923', letterSpacing: 3, marginTop: 2, textTransform: 'uppercase' },
  
  qrContainer: { backgroundColor: '#fff', padding: 3, borderRadius: 4 },
  qrImage: { width: 50, height: 50 },

  // BODY
  body: { padding: 30 },

  // HERO SECTION (Foto + Stamp)
  heroContainer: { flexDirection: 'row', marginBottom: 25, height: 210 },
  imageWrapper: { width: '58%', height: '100%', position: 'relative' },
  heroImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 },
  
  // Stamp de Estado (Marca de Agua)
  statusStamp: {
    position: 'absolute',
    top: 20,
    left: -10,
    backgroundColor: 'rgba(200, 0, 0, 0.9)',
    paddingVertical: 5,
    paddingHorizontal: 30,
    transform: 'rotate(-45deg)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
    width: 200,
    textAlign: 'center'
  },
  stampText: { color: '#fff', fontWeight: 'black', fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 },

  heroInfo: { width: '42%', paddingLeft: 25, justifyContent: 'center' },
  
  carBrand: { fontSize: 10, color: '#E8B923', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  carModel: { fontSize: 26, fontWeight: 'heavy', color: '#000', lineHeight: 1, marginBottom: 5 },
  carVersion: { fontSize: 11, color: '#555', marginBottom: 15 },
  
  priceBadge: { backgroundColor: '#E8B923', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 4, alignSelf: 'flex-start', shadowOpacity: 0.5 },
  priceText: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  priceLabel: { fontSize: 7, color: '#000', textTransform: 'uppercase', marginBottom: 1 },

  // COLUMNAS
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  colLeft: { width: '48%' },
  colRight: { width: '48%' },

  sectionTitle: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#000', 
    textTransform: 'uppercase', 
    borderBottomWidth: 2, 
    borderBottomColor: '#E8B923', 
    paddingBottom: 4,
    marginBottom: 10,
    marginTop: 15
  },

  // ZEBRA STRIPED LIST
  listItem: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  listItemAlt: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 4, backgroundColor: '#f9f9f9', borderRadius: 2 },
  listLabel: { width: '40%', fontSize: 9, color: '#666' },
  listValue: { width: '60%', fontSize: 9, color: '#000', fontWeight: 'bold' },

  // FINANCE
  financeBox: { backgroundColor: '#fffbe6', borderRadius: 6, padding: 12, borderLeftWidth: 4, borderLeftColor: '#E8B923' },
  financeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  financeText: { fontSize: 9, color: '#555' },
  financeValue: { fontSize: 9, fontWeight: 'bold', color: '#000' },

  // GALLERY
  galleryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, height: 85 },
  galleryImg: { width: '32%', height: '100%', objectFit: 'cover', borderRadius: 4, backgroundColor: '#eee' },

  // FOOTER
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: 45, 
    backgroundColor: '#1a1a1a', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  footerText: { fontSize: 8, color: '#aaa', textDecoration: 'none' }
});

const formatPrice = (price: number) => 
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(price || 0);

const calculateQuote = (price: number, months: number) => {
    const pie = price * 0.20;
    const loan = price - pie;
    const rate = 0.022; 
    const quote = (loan * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return formatPrice(quote);
};

// Componente para filas tipo cebra
const ZebraRow = ({ label, value, index }: { label: string, value: string | number, index: number }) => (
    <View style={index % 2 === 0 ? styles.listItem : styles.listItemAlt}>
        <Text style={styles.listLabel}>{label}</Text>
        <Text style={styles.listValue}>{value}</Text>
    </View>
);

export const CarPdfDocument = ({ car }: { car: Vehiculo }) => {
  const mainImage = car.imagenes?.[0] || car.imagen;
  const galleryImages = car.imagenes?.slice(1, 4) || [];
  const isAvailable = car.estado === 'Disponible';

  // Datos para la tabla izquierda
  const specs = [
      { l: 'Motor', v: car.motor || car.cilindrada || 'N/A' },
      { l: 'Combustible', v: car.combustible },
      { l: 'Transmisión', v: car.transmision },
      { l: 'Tracción', v: car.traccion || '4x2' },
      { l: 'Kilometraje', v: `${car.km.toLocaleString()} km` },
      { l: 'Dueños', v: car.duenos },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <View>
                <Text style={styles.brandTitle}>LIONS CARS</Text>
                <Text style={styles.brandSubtitle}>Catálogo Profesional</Text>
            </View>
            <Link src={`https://lionscars.cl/auto/${car.id}`} style={styles.qrContainer}>
                <Image 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`LionsCars ID: ${car.id}`)}`} 
                    style={styles.qrImage} 
                />
            </Link>
        </View>

        <View style={styles.body}>
            
            {/* HERO SECTION */}
            <View style={styles.heroContainer}>
                <View style={styles.imageWrapper}>
                    {mainImage ? (
                        <Image src={mainImage} style={styles.heroImage} />
                    ) : (
                        <View style={[styles.heroImage, { backgroundColor: '#eee' }]} />
                    )}

                    {/* --- MARCA DE AGUA SI NO ESTÁ DISPONIBLE --- */}
                    {!isAvailable && (
                        <View style={styles.statusStamp}>
                            <Text style={styles.stampText}>{car.estado}</Text>
                        </View>
                    )}
                </View>
                
                <View style={styles.heroInfo}>
                    <Text style={styles.carBrand}>{car.marca}</Text>
                    <Text style={styles.carModel}>{car.modelo}</Text>
                    <Text style={styles.carVersion}>{car.version}</Text>
                    
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceLabel}>Valor Contado</Text>
                        <Text style={styles.priceText}>{formatPrice(car.precio)}</Text>
                    </View>

                    <Text style={{ marginTop: 20, fontSize: 8, color: '#666' }}>ID Ref: #{car.id}</Text>
                    <Text style={{ fontSize: 8, color: '#666' }}>Año: {car.ano}</Text>
                    {car.vendedor && <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>Asesor: {car.vendedor}</Text>}
                </View>
            </View>

            <View style={styles.rowContainer}>
                {/* COLUMNA IZQUIERDA */}
                <View style={styles.colLeft}>
                    <Text style={styles.sectionTitle}>Ficha Técnica</Text>
                    {specs.map((s, i) => <ZebraRow key={i} index={i} label={s.l} value={s.v} />)}
                    
                    <Text style={styles.sectionTitle}>Estado & Papeles</Text>
                    <ZebraRow index={0} label="Aire Acond." value={car.aire ? 'SÍ, Funcionando' : 'NO'} />
                    <ZebraRow index={1} label="Neumáticos" value={car.neumaticos || 'Estándar'} />
                    <ZebraRow index={0} label="Documentación" value="Al Día 2026" />
                </View>

                {/* COLUMNA DERECHA */}
                <View style={styles.colRight}>
                    <Text style={styles.sectionTitle}>Simulación Comercial</Text>
                    
                    {car.financiable ? (
                        <View style={styles.financeBox}>
                            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8, borderBottomWidth:1, borderBottomColor:'#E8B923', paddingBottom:4}}>
                                <Text style={{fontSize:9, fontWeight:'bold', color:'#E8B923'}}>PLAN FLEXIBLE</Text>
                                <Text style={{fontSize:9, fontWeight:'bold', color:'#000'}}>PIE 20%</Text>
                            </View>
                            <View style={styles.financeRow}>
                                <Text style={styles.financeText}>Pie Inicial:</Text>
                                <Text style={styles.financeValue}>{formatPrice(car.precio * 0.2)}</Text>
                            </View>
                            <View style={styles.financeRow}>
                                <Text style={styles.financeText}>24 Cuotas est.:</Text>
                                <Text style={styles.financeValue}>{calculateQuote(car.precio, 24)}</Text>
                            </View>
                            <View style={styles.financeRow}>
                                <Text style={styles.financeText}>36 Cuotas est.:</Text>
                                <Text style={styles.financeValue}>{calculateQuote(car.precio, 36)}</Text>
                            </View>
                            <View style={styles.financeRow}>
                                <Text style={styles.financeText}>48 Cuotas est.:</Text>
                                <Text style={styles.financeValue}>{calculateQuote(car.precio, 48)}</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={[styles.financeBox, { backgroundColor: '#f0f0f0', borderLeftColor: '#999' }]}>
                             <Text style={{fontSize:9, fontWeight:'bold', color:'#555'}}>VENTA SOLO CONTADO</Text>
                             <Text style={{fontSize:8, color:'#666', marginTop:4}}>Vehículo no aplica para crédito automotriz estándar por año o condiciones comerciales.</Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Observaciones</Text>
                    <Text style={{ fontSize: 9, color: '#444', lineHeight: 1.5, fontStyle: 'italic', backgroundColor:'#f9f9f9', padding:8, borderRadius:4 }}>
                        "{car.obs || 'Vehículo seleccionado bajo estándares de calidad Lions Cars.'}"
                    </Text>
                </View>
            </View>

            {/* GALERÍA */}
            {galleryImages.length > 0 && (
                <View style={styles.galleryRow}>
                    {galleryImages.map((img, index) => (
                         <Image key={index} src={img} style={styles.galleryImg} />
                    ))}
                    {galleryImages.length < 3 && <View style={styles.galleryImg} />} 
                    {galleryImages.length < 2 && <View style={styles.galleryImg} />} 
                </View>
            )}
        </View>

        {/* FOOTER CLICKABLE */}
        <View style={styles.footer}>
            <Text style={styles.footerText}>Av. Gabriela Mistral 925, Puerto Montt | </Text>
            <Link src="https://wa.me/56958016208" style={{ textDecoration: 'none' }}>
                <Text style={[styles.footerText, { color: '#E8B923', fontWeight: 'bold' }]}>WhatsApp: +56 9 5801 6208</Text>
            </Link>
            <Text style={styles.footerText}> | www.lionscars.cl</Text>
        </View>

      </Page>
    </Document>
  );
};
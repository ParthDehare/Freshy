import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for pickup vs delivery
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapBounds({ pickup, delivery }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && delivery) {
      const bounds = L.latLngBounds([pickup.lat, pickup.lng], [delivery.lat, delivery.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pickup, delivery, map]);
  return null;
}

export default function MapView({
  pickup,
  delivery,
  status,
  driverName,
  trackingId,
  pickupAddress,
  deliveryAddress
}) {
  if (!pickup || !delivery) {
    return (
      <div className="h-96 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl flex items-center justify-center text-neutral-400 text-sm">
        No geographic coordinates available for this shipment route.
      </div>
    );
  }

  const pickupPos = [pickup.lat, pickup.lng];
  const deliveryPos = [delivery.lat, delivery.lng];

  // Simulate driver current position roughly halfway if IN_TRANSIT
  const driverPos = [
    (pickup.lat + delivery.lat) / 2 + 0.1,
    (pickup.lng + delivery.lng) / 2 - 0.05
  ];

  return (
    <div className="h-[420px] w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl relative z-10">
      <MapContainer
        center={driverPos}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="bg-neutral-950"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={pickupPos} icon={pickupIcon}>
          <Popup>
            <div className="font-bold text-neutral-900">🍏 Pickup Orchard Hub</div>
            <div className="text-xs text-neutral-600">{pickupAddress || 'Nagpur/Nashik Orchard Depot'}</div>
          </Popup>
        </Marker>

        <Marker position={deliveryPos} icon={deliveryIcon}>
          <Popup>
            <div className="font-bold text-neutral-900">🏢 Delivery Retail Hub</div>
            <div className="text-xs text-neutral-600">{deliveryAddress || 'Vashi APMC Wholesale Market'}</div>
          </Popup>
        </Marker>

        {status === 'IN_TRANSIT' && (
          <Marker position={driverPos} icon={driverIcon}>
            <Popup>
              <div className="font-bold text-neutral-900">🚚 {driverName || 'Active Driver'}</div>
              <div className="text-xs text-neutral-600">En Route ({trackingId})</div>
            </Popup>
          </Marker>
        )}

        <Polyline
          positions={[pickupPos, driverPos, deliveryPos]}
          color={status === 'DELIVERED' ? '#10b981' : '#3b82f6'}
          weight={4}
          dashArray={status === 'IN_TRANSIT' ? '8, 8' : undefined}
        />

        <MapBounds pickup={pickup} delivery={delivery} />
      </MapContainer>
    </div>
  );
}

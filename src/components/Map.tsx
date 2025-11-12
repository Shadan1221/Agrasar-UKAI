import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertCircle, Building2 } from 'lucide-react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const villageIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const assetGoodIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const assetPoorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Village {
  id: string;
  name: string;
  block: string;
  district: string;
  population: number;
  lat: number;
  lng: number;
}

interface Asset {
  id: string;
  name: string;
  type: string;
  condition: string;
  village_id: string | null;
  lat: number | null;
  lng: number | null;
}

interface Incident {
  id: string;
  asset_type: string | null;
  description: string | null;
  status: string;
  severity: string;
  village_id: string | null;
  lat: number | null;
  lng: number | null;
}

interface MapProps {
  villages?: Village[];
  assets?: Asset[];
  incidents?: Incident[];
  showVillages?: boolean;
  showAssets?: boolean;
  showIncidents?: boolean;
  height?: string;
}

// Component to fit map bounds
function FitBounds({ villages, assets, incidents, showVillages, showAssets, showIncidents }: {
  villages?: Village[];
  assets?: Asset[];
  incidents?: Incident[];
  showVillages?: boolean;
  showAssets?: boolean;
  showIncidents?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    const bounds: [number, number][] = [];
    
    if (showVillages && villages && villages.length > 0) {
      villages.forEach(v => {
        if (v.lat && v.lng) bounds.push([v.lat, v.lng]);
      });
    }
    
    if (showAssets && assets && assets.length > 0) {
      assets.forEach(a => {
        if (a.lat && a.lng) bounds.push([a.lat, a.lng]);
      });
    }
    
    if (showIncidents && incidents && incidents.length > 0) {
      incidents.forEach(i => {
        if (i.lat && i.lng) bounds.push([i.lat, i.lng]);
      });
    }

    if (bounds.length > 0) {
      try {
        const latlngBounds = L.latLngBounds(bounds);
        map.fitBounds(latlngBounds, { padding: [50, 50] });
      } catch (error) {
        console.error('Error fitting bounds:', error);
        map.setView([24.572, 78.135], 10);
      }
    }
  }, [map, villages, assets, incidents, showVillages, showAssets, showIncidents]);

  return null;
}

export const Map = ({ 
  villages = [], 
  assets = [], 
  incidents = [],
  showVillages = true,
  showAssets = true,
  showIncidents = true,
  height = "500px"
}: MapProps) => {
  // Default center to India (Madhya Pradesh region based on sample data)
  const defaultCenter: [number, number] = villages && villages.length > 0 && villages[0].lat && villages[0].lng
    ? [villages[0].lat, villages[0].lng]
    : [24.572, 78.135];
  const defaultZoom = villages && villages.length > 0 ? 10 : 6;

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds 
          villages={villages}
          assets={assets}
          incidents={incidents}
          showVillages={showVillages}
          showAssets={showAssets}
          showIncidents={showIncidents}
        />

        {showVillages && villages.map((village) => (
          village.lat && village.lng && (
            <Marker
              key={`village-${village.id}`}
              position={[village.lat, village.lng]}
              icon={villageIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    {village.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {village.block}, {village.district}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Population: {village.population.toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {showAssets && assets.map((asset) => (
          asset.lat && asset.lng && (
            <Marker
              key={`asset-${asset.id}`}
              position={[asset.lat, asset.lng]}
              icon={asset.condition === 'Poor' ? assetPoorIcon : assetGoodIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    {asset.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {asset.type}
                  </p>
                  <Badge 
                    variant={asset.condition === 'Good' ? 'default' : asset.condition === 'Fair' ? 'secondary' : 'destructive'}
                    className="mt-1 text-xs"
                  >
                    {asset.condition}
                  </Badge>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {showIncidents && incidents.map((incident) => (
          incident.lat && incident.lng && (
            <Marker
              key={`incident-${incident.id}`}
              position={[incident.lat, incident.lng]}
              icon={incidentIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    {incident.asset_type || 'General Issue'}
                  </h3>
                  {incident.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {incident.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {incident.status}
                    </Badge>
                    <Badge 
                      variant={incident.severity === 'High' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {incident.severity}
                    </Badge>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;


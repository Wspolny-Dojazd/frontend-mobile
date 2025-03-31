import { useColorScheme } from 'nativewind';
import { Ref, forwardRef } from 'react';
import { Platform } from 'react-native';
import MapView, { MapViewProps, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';

export const CustomMapView = forwardRef((props: MapViewProps, ref: Ref<MapView>) => {
  const { colorScheme } = useColorScheme();

  return (
    <MapView
      ref={ref}
      style={{ flex: 1 }}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
      userInterfaceStyle={colorScheme === 'dark' ? 'dark' : 'light'}
      customMapStyle={Platform.OS === 'android' && colorScheme === 'dark' ? darkMapStyle : []}
      {...props}
    />
  );
});

// const darkMapStyle = [
//   {
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#000000', // Pure black background
//       },
//     ],
//   },
//   {
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#FFFFFF', // White text for maximum contrast
//       },
//     ],
//   },
//   {
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#000000', // Black stroke to separate text if needed
//         weight: 0.1, // Keep it subtle
//       },
//     ],
//   },
//   {
//     featureType: 'administrative.country',
//     elementType: 'geometry.stroke',
//     stylers: [
//       {
//         color: '#222222', // Dark gray for subtle borders
//       },
//     ],
//   },
//   {
//     featureType: 'administrative.land_parcel',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#444444', // Slightly lighter gray for land parcel labels
//       },
//     ],
//   },
//   {
//     featureType: 'administrative.province',
//     elementType: 'geometry.stroke',
//     stylers: [
//       {
//         color: '#222222', // Dark gray for province borders
//       },
//     ],
//   },
//   {
//     featureType: 'landscape.man_made',
//     elementType: 'geometry.stroke',
//     stylers: [
//       {
//         color: '#111111', // Very dark gray for subtle structure
//       },
//     ],
//   },
//   {
//     featureType: 'landscape.natural',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#000000', // Keep natural landscape black
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#111111', // Very dark gray for points of interest
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#AAAAAA', // Light gray for POI labels
//       },
//     ],
//   },
//   {
//     featureType: 'poi',
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#000000',
//         weight: 0.1,
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'geometry.fill',
//     stylers: [
//       {
//         color: '#000000', // Keep parks black
//       },
//     ],
//   },
//   {
//     featureType: 'poi.park',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#888888', // Medium gray for park labels
//       },
//     ],
//   },
//   {
//     featureType: 'road',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#222222', // Dark gray for roads
//       },
//     ],
//   },
//   {
//     featureType: 'road',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#CCCCCC', // Light gray for road labels
//       },
//     ],
//   },
//   {
//     featureType: 'road',
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#000000',
//         weight: 0.1,
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#444444', // Slightly lighter gray for highways
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'geometry.stroke',
//     stylers: [
//       {
//         color: '#333333', // Slightly darker gray for highway stroke
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#EEEEEE', // Very light gray for highway labels
//       },
//     ],
//   },
//   {
//     featureType: 'road.highway',
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#000000',
//         weight: 0.1,
//       },
//     ],
//   },
//   {
//     featureType: 'transit',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#AAAAAA', // Light gray for transit labels
//       },
//     ],
//   },
//   {
//     featureType: 'transit',
//     elementType: 'labels.text.stroke',
//     stylers: [
//       {
//         color: '#000000',
//         weight: 0.1,
//       },
//     ],
//   },
//   {
//     featureType: 'transit.line',
//     elementType: 'geometry.fill',
//     stylers: [
//       {
//         color: '#111111', // Very dark gray for transit lines
//       },
//     ],
//   },
//   {
//     featureType: 'transit.station',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#222222', // Dark gray for transit stations
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'geometry',
//     stylers: [
//       {
//         color: '#000000', // Pure black for water
//       },
//     ],
//   },
//   {
//     featureType: 'water',
//     elementType: 'labels.text.fill',
//     stylers: [
//       {
//         color: '#333333', // Very dark gray for water labels
//       },
//     ],
//   },
// ];

const darkMapStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#D1D5DB',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#1F2937',
      },
    ],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#4B5563',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6B7280',
      },
    ],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#4B5563',
      },
    ],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#374151',
      },
    ],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#111827',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9CA3AF',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#1F2937',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6B7280',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#374151',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#E5E7EB',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#1F2937',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#4B5563',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#374151',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#F3F4F6',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#E5E7EB',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#1F2937',
      },
    ],
  },
  {
    featureType: 'transit.line',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#111827',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'geometry',
    stylers: [
      {
        color: '#1F2937',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#000000',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6B7280',
      },
    ],
  },
];

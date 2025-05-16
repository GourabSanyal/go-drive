import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, Platform } from "react-native";
import MapboxGL from "@rnmapbox/maps";

// Replace with your actual public token if different
const MAPBOX_PUBLIC_TOKEN =
  "pk.eyJ1IjoiZ29jYWJzIiwiYSI6ImNtYXBnMmJncTA4NXQyanF2NXIzMHEwNWkifQ.7arQIkXZmcjAiGaqPRKDAQ";

MapboxGL.setAccessToken(MAPBOX_PUBLIC_TOKEN);

interface DriverMapProps {
  pickupCoordinates?: [number, number]; // [longitude, latitude]
  destinationCoordinates?: [number, number]; // [longitude, latitude]
  driverLocation?: [number, number]; // [longitude, latitude]
  onMapLoaded?: () => void;
}

const DriverMap: React.FC<DriverMapProps> = ({
  pickupCoordinates,
  destinationCoordinates,
  driverLocation,
  onMapLoaded,
}) => {
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  useEffect(() => {
    // It's good practice to request permissions if using UserLocation
    // For now, we'll focus on displaying provided coordinates
    if (Platform.OS === "android") {
      MapboxGL.requestAndroidLocationPermissions();
    }
  }, []);

  useEffect(() => {
    if (driverLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: driverLocation,
        zoomLevel: 15,
        animationDuration: 1000,
      });
    } else if (pickupCoordinates && cameraRef.current && !driverLocation) {
      cameraRef.current.setCamera({
        centerCoordinate: pickupCoordinates,
        zoomLevel: 12,
      });
    }
  }, [driverLocation, pickupCoordinates]);

  // Route GeoJSON state
  const [route, setRoute] = React.useState<GeoJSON.FeatureCollection | null>(
    null
  );

  // Function to fetch and display route
  const fetchAndDisplayRoute = async (
    start: [number, number],
    end: [number, number]
  ) => {
    const profile = "mapbox/driving-traffic"; // or 'mapbox/driving'
    const coordinates = `${start.join(",")};${end.join(",")}`;
    const url = `https://api.mapbox.com/directions/v5/${profile}/${coordinates}?steps=true&geometries=geojson&access_token=${MAPBOX_PUBLIC_TOKEN}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.routes && json.routes.length > 0 && json.routes[0].geometry) {
        const routeGeometry = json.routes[0].geometry;
        const newRouteGeoJSON: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: routeGeometry, // This is a GeoJSON LineString from the API
            },
          ],
        };
        setRoute(newRouteGeoJSON);

        if (
          mapRef.current &&
          cameraRef.current &&
          routeGeometry.coordinates &&
          routeGeometry.coordinates.length > 1
        ) {
          const routeCoordinates = routeGeometry.coordinates;
          cameraRef.current.fitBounds(
            routeCoordinates[routeCoordinates.length - 1], // northeast
            routeCoordinates[0], // southwest
            [60, 60, 60, 60], // padding: top, right, bottom, left
            500 // animation duration
          );
        }
      } else {
        console.warn(
          "No route found or route geometry missing:",
          json.message || json
        );
        setRoute(null);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      setRoute(null);
    }
  };

  useEffect(() => {
    if (pickupCoordinates && destinationCoordinates) {
      fetchAndDisplayRoute(pickupCoordinates, destinationCoordinates);
    } else {
      setRoute(null); // Clear route if coordinates are not valid
    }
  }, [pickupCoordinates, destinationCoordinates]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        onDidFinishLoadingMap={onMapLoaded}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: driverLocation ||
              pickupCoordinates ||
              destinationCoordinates || [-73.98513, 40.758896],
            zoomLevel:
              driverLocation || pickupCoordinates || destinationCoordinates
                ? 12
                : 2,
          }}
          animationMode={"flyTo"}
          animationDuration={1200}
        />

        {/* Driver's Current Location Puck */}
        {driverLocation && (
          <MapboxGL.MarkerView
            id="driverLocationMarker"
            coordinate={driverLocation}
          >
            <View style={styles.driverPuck} />
          </MapboxGL.MarkerView>
        )}

        {/* Pickup Marker */}
        {pickupCoordinates && (
          <MapboxGL.PointAnnotation
            id="pickupLocation"
            coordinate={pickupCoordinates}
          >
            <View style={styles.simpleRedMarker} />
            <MapboxGL.Callout title="Pickup Location" />
          </MapboxGL.PointAnnotation>
        )}

        {/* Destination Marker */}
        {destinationCoordinates && (
          <MapboxGL.PointAnnotation
            id="destinationLocation"
            coordinate={destinationCoordinates}
          >
            <View style={styles.simpleGreenMarker} />
            <MapboxGL.Callout title="Destination" />
          </MapboxGL.PointAnnotation>
        )}

        {route && (
          <MapboxGL.ShapeSource id="routeSource" shape={route}>
            <MapboxGL.LineLayer
              id="routeLine"
              style={{
                lineColor: "#007AFF",
                lineWidth: 5,
                lineOpacity: 0.85,
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        <MapboxGL.UserLocation
          visible={true}
          showsUserHeadingIndicator={true}
          minDisplacement={5} // meters
          onUpdate={(location) => {
            console.log(
              "Driver current location:",
              location.coords.longitude,
              location.coords.latitude
            );
            // TODO: Update driverLocation prop/state from here
            // e.g., if you pass a function like setDriverCurrentLocation as a prop:
            // if (props.setDriverCurrentLocation) {
            //   props.setDriverCurrentLocation([location.coords.longitude, location.coords.latitude]);
            // }
          }}
        />
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  annotationContainer: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#333",
  },
  annotationFillRed: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "red",
    transform: [{ scale: 0.8 }],
  },
  annotationFillGreen: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "green",
    transform: [{ scale: 0.8 }],
  },
  simpleRedMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "red",
    borderColor: "white",
    borderWidth: 2,
  },
  simpleGreenMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "green",
    borderColor: "white",
    borderWidth: 2,
  },
  driverPuck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "blue",
    borderColor: "white",
    borderWidth: 2,
  },
});

export default DriverMap;

import React from "react";
import { StyleSheet } from "react-native";
import { Button, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import EditScreenInfo from "@/components/EditScreenInfo";
import { useEffect, useState } from "react";
import { socketClient } from "@src/services/socket/client/socketClient";
import { dummyRideRequest } from "@src/data/dummyRideRequest";

export default function TabOneScreen() {
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [clientList, setClientList] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("test_room_123");

  useEffect(() => {
    const checkConnectionStatus = () => {
      const { isConnected, socketId } = socketClient.getConnectionStatus();
      setIsConnected(isConnected);
      setSocketId(socketId);
      setClientList(socketClient.getClientList());
    };
    checkConnectionStatus();

    // check status
    const interval = setInterval(checkConnectionStatus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleSocketAction = () => {
    if (!isConnected) {
      socketClient.connect();
    } else {
      socketClient.joinRoomAndSendRequest(selectedRoom, dummyRideRequest);
    }
  };

  const handleDisconnect = () => {
    socketClient.disconnect();
  };

  const handleJoinRoom = () => {
    socketClient.joinRoom(selectedRoom);
  };

  const handleLeaveRoom = () => {
    socketClient.leaveRoom(selectedRoom);
  };

  const handleSendRideRequest = () => {
    socketClient.sendRideRequest(dummyRideRequest);
  };

  const handleAcceptRide = () => {
    socketClient.acceptRide("test_ride_123", socketId || "");
  };

  const handleListClients = () => {
    socketClient.listClients();
  };

  const handleKeepOneClient = () => {
    if (clientList.length > 0) {
      socketClient.keepOneClient(selectedRoom, clientList[0].id);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Socket.IO Test Panel</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Text style={styles.status}>
        Connection Status: {isConnected ? "Connected" : "Disconnected"}
      </Text>
      {socketId && <Text style={styles.socketId}>Socket ID: {socketId}</Text>}

      <View style={styles.buttonContainer}>
        <Button
          title={isConnected ? "Join Room & Send Request" : "Connect to Server"}
          onPress={handleSocketAction}
        />
        {isConnected && (
          <>
            <Button
              title="Disconnect from Server"
              onPress={handleDisconnect}
              color="red"
            />
            <Button
              title="Join Room"
              onPress={handleJoinRoom}
            />
            <Button
              title="Leave Room"
              onPress={handleLeaveRoom}
            />
            <Button
              title="Send Ride Request"
              onPress={handleSendRideRequest}
            />
            <Button
              title="Accept Ride"
              onPress={handleAcceptRide}
            />
            <Button
              title="List Clients"
              onPress={handleListClients}
            />
            <Button
              title="Keep One Client"
              onPress={handleKeepOneClient}
            />
          </>
        )}
      </View>

      {clientList.length > 0 && (
        <View style={styles.clientList}>
          <Text style={styles.subtitle}>Connected Clients:</Text>
          {clientList.map((client) => (
            <View key={client.id} style={styles.clientItem}>
              <Text>ID: {client.id}</Text>
              <Text>Rooms: {client.rooms.join(", ")}</Text>
            </View>
          ))}
        </View>
      )}

      <EditScreenInfo path="app/(tabs)/index.tsx" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  status: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  socketId: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "100%",
  },
  buttonContainer: {
    gap: 10,
    marginVertical: 20,
  },
  clientList: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  clientItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});
